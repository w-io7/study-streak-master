import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Material = z.object({
  vocabulary: z.array(z.string()),
  grammar: z.array(z.string()),
  notes: z.array(z.string()),
});

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  source: string;
};

export const generateQuiz = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Material.parse(data))
  .handler(async ({ data }): Promise<{ questions: QuizQuestion[] }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured yet.");

    if (data.vocabulary.length + data.grammar.length === 0) {
      throw new Error("Add some vocabulary or grammar first.");
    }

    const prompt = [
      "Build a multiple-choice quiz that tests ONLY the student's own study material below.",
      "",
      "VOCABULARY:",
      data.vocabulary.join("\n") || "(none)",
      "",
      "GRAMMAR:",
      data.grammar.join("\n") || "(none)",
      "",
      "GENERAL NOTES:",
      data.notes.join("\n") || "(none)",
      "",
      'Return JSON only: {"questions":[{"question":string,"options":[string,string,string,string],"answerIndex":number,"source":string}]}',
      "Make between 4 and 8 questions, one correct option each, answerIndex is 0-based,",
      "and source names the word or rule the question came from. Keep questions short and clear.",
    ].join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an English teacher who writes quizzes strictly from the student's own notes. Respond with JSON only.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      if (response.status === 429) throw new Error("The quiz maker is busy. Try again in a moment.");
      if (response.status === 402)
        throw new Error("AI credits for this app have run out. Add credits to keep making quizzes.");
      if (response.status === 403)
        throw new Error("AI is blocked for this workspace right now.");
      throw new Error(`Could not build the quiz (${response.status}). ${text.slice(0, 200)}`);
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content ?? "{}";

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("The quiz came back in an unreadable form. Try again.");
    }

    const shape = z.object({
      questions: z.array(
        z.object({
          question: z.string(),
          options: z.array(z.string()),
          answerIndex: z.number(),
          source: z.string().optional(),
        }),
      ),
    });

    const result = shape.safeParse(parsed);
    if (!result.success || result.data.questions.length === 0) {
      throw new Error("The quiz came back empty. Try again.");
    }

    return {
      questions: result.data.questions
        .filter((q) => q.options.length >= 2)
        .map((q) => ({
          question: q.question,
          options: q.options,
          answerIndex: Math.max(0, Math.min(q.options.length - 1, Math.round(q.answerIndex))),
          source: q.source ?? "your material",
        })),
    };
  });
