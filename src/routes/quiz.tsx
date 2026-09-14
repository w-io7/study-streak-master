import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { generateQuiz, type QuizQuestion } from "@/lib/quiz.functions";
import { useStudy } from "@/lib/study-store";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "AI quiz from your material — Lattice" },
      {
        name: "description",
        content:
          "Generate a quiz written only from the English vocabulary and grammar you saved, then record your score.",
      },
      { property: "og:title", content: "AI quiz from your material — Lattice" },
      {
        property: "og:description",
        content: "Questions built from your own vocabulary and grammar boxes.",
      },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const { entriesOf, recordQuiz, state, quizStatus } = useStudy();
  const makeQuiz = useServerFn(generateQuiz);

  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vocab = entriesOf("vocab");
  const grammar = entriesOf("grammar");
  const notes = entriesOf("note");
  const materialCount = vocab.length + grammar.length;

  const build = async () => {
    setLoading(true);
    setError(null);
    setSubmitted(false);
    setAnswers({});
    setQuestions(null);
    try {
      const result = await makeQuiz({
        data: {
          vocabulary: vocab.map((e) =>
            [e.fields.word, e.fields.pos, e.fields.meaning, ...e.extras.map((x) => `${x.label}: ${x.value}`)]
              .filter(Boolean)
              .join(" — "),
          ),
          grammar: grammar.map((e) =>
            [e.fields.rule, e.fields.brief, ...e.extras.map((x) => `${x.label}: ${x.value}`)]
              .filter(Boolean)
              .join(" — "),
          ),
          notes: notes.map((e) => [e.fields.title, e.fields.text].filter(Boolean).join(" — ")),
        },
      });
      setQuestions(result.questions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not build the quiz.");
    } finally {
      setLoading(false);
    }
  };

  const score = questions
    ? questions.reduce((total, q, i) => (answers[i] === q.answerIndex ? total + 1 : total), 0)
    : 0;

  const submit = () => {
    if (!questions) return;
    setSubmitted(true);
    recordQuiz(score, questions.length);
  };

  const lastQuiz = state.quizzes[0];

  return (
    <section className="rise">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-none tracking-tight lg:text-5xl">Quiz</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Questions written only from your own vocabulary and grammar boxes.
          </p>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {materialCount} boxes to draw from
        </span>
      </div>

      <div className="rounded-[18px] bg-surface p-4 ring-1 ring-black/5 lg:p-5">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Status
            </p>
            <p className="text-sm font-medium">
              {materialCount < 3
                ? `Add ${3 - materialCount} more vocabulary or grammar box${3 - materialCount === 1 ? "" : "es"} to unlock a quiz`
                : quizStatus.label}
            </p>
            {lastQuiz ? (
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                last taken {new Date(lastQuiz.takenAt).toLocaleString()}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={build}
            disabled={loading || materialCount < 3}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[background,transform] duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Writing questions…" : questions ? "New quiz" : "Build my quiz"}
          </button>
        </div>

        {error ? (
          <p className="mt-4 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-ink">
            {error}
          </p>
        ) : null}
      </div>

      {questions ? (
        <div className="mt-6 space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="rise rounded-[14px] bg-surface p-4 ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-xl leading-snug">
                  {i + 1}. {q.question}
                </p>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {q.source}
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {q.options.map((option, oi) => {
                  const chosen = answers[i] === oi;
                  const correct = submitted && oi === q.answerIndex;
                  const wrong = submitted && chosen && oi !== q.answerIndex;
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswers((prev) => ({ ...prev, [i]: oi }))}
                      className={`rounded-md border px-3 py-2 text-left text-sm transition-colors duration-200 ${
                        correct
                          ? "border-primary bg-primary/15"
                          : wrong
                            ? "border-line bg-line/60 line-through"
                            : chosen
                              ? "border-primary bg-paper"
                              : "border-line bg-paper hover:border-primary/40"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {submitted ? (
            <div className="rounded-[14px] bg-ink p-5 text-paper">
              <p className="font-display text-3xl leading-none">
                {score} / {questions.length}
              </p>
              <p className="mt-2 text-sm opacity-80">
                Saved to your record, and today counts towards your streak.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={Object.keys(answers).length !== questions.length}
              className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Check my answers
            </button>
          )}
        </div>
      ) : null}

      {state.quizzes.length > 0 ? (
        <div className="mt-10">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Quiz history
          </p>
          <ul className="divide-y divide-line rounded-[14px] bg-surface ring-1 ring-black/5">
            {state.quizzes.map((quiz) => (
              <li key={quiz.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-mono text-[11px] text-muted-foreground">
                  {new Date(quiz.takenAt).toLocaleString()}
                </span>
                <span className="font-medium">
                  {quiz.score} / {quiz.total}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
