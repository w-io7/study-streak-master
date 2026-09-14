import { createFileRoute, Link } from "@tanstack/react-router";

import { useStudy } from "@/lib/study-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lattice — track your English study" },
      {
        name: "description",
        content:
          "See your English study streak, progress, last session and quiz status, all built from what you actually studied.",
      },
      { property: "og:title", content: "Lattice — track your English study" },
      {
        property: "og:description",
        content: "Streak, progress and quiz status built from your own vocabulary, grammar and notes.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const {
    entriesOf,
    streak,
    progress,
    studiedCount,
    totalCount,
    lastSessionLabel,
    quizStatus,
    state,
    hydrated,
  } = useStudy();

  const sections = [
    {
      to: "/vocabulary" as const,
      label: "Vocabulary",
      note: "Words, meanings, extra boxes.",
      entries: entriesOf("vocab"),
    },
    {
      to: "/grammar" as const,
      label: "Grammar",
      note: "Rules and patterns you keep.",
      entries: entriesOf("grammar"),
    },
    {
      to: "/notes" as const,
      label: "Notes",
      note: "Everything else worth keeping.",
      entries: entriesOf("note"),
    },
  ];

  const lastQuiz = state.quizzes[0];

  return (
    <section className="rise">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-none tracking-tight lg:text-5xl">
            Your study, as it really is
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Nothing here is made up. Every number below comes from the boxes you added and the ones
            you ticked as studied.
          </p>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {hydrated ? `${totalCount} boxes` : "loading"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[14px] bg-surface p-4 ring-1 ring-black/5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Study streak
          </span>
          <p className="mt-1 font-display text-4xl leading-none text-primary">{streak}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {streak === 0 ? "Study today to start it" : "consecutive days studied"}
          </p>
        </div>
        <div className="rounded-[14px] bg-surface p-4 ring-1 ring-black/5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Progress
          </span>
          <p className="mt-1 font-display text-4xl leading-none">{progress}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {studiedCount} studied, {Math.max(totalCount - studiedCount, 0)} left
          </p>
        </div>
        <div className="rounded-[14px] bg-surface p-4 ring-1 ring-black/5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Last session
          </span>
          <p className="mt-1 font-display text-2xl leading-tight">{lastSessionLabel}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {state.sessionDays.length} day{state.sessionDays.length === 1 ? "" : "s"} of study logged
          </p>
        </div>
        <div className="rounded-[14px] bg-surface p-4 ring-1 ring-black/5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Quiz status
          </span>
          <p className="mt-1 font-display text-2xl leading-tight">{quizStatus.label}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {lastQuiz
              ? `${state.quizzes.length} quiz${state.quizzes.length === 1 ? "" : "zes"} taken`
              : "needs 3 vocabulary or grammar boxes"}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {sections.map((section) => {
          const studied = section.entries.filter((e) => e.studied).length;
          return (
            <Link
              key={section.to}
              to={section.to}
              className="rounded-[14px] bg-surface p-4 ring-1 ring-black/5 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:ring-black/10"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl leading-none">{section.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {studied}/{section.entries.length} ticked
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{section.note}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 rounded-[18px] border border-dashed border-line p-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-2xl leading-none tracking-tight">Quiz from your boxes</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              The quiz is written only from the vocabulary and grammar you saved.
            </p>
          </div>
          <Link
            to="/quiz"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[background,transform] duration-200 hover:bg-primary/90 active:scale-[0.98]"
          >
            Open quiz
          </Link>
        </div>
      </div>
    </section>
  );
}
