import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { EntryCard } from "@/components/EntryCard";
import { useStudy } from "@/lib/study-store";

export const Route = createFileRoute("/vocabulary")({
  head: () => ({
    meta: [
      { title: "Vocabulary boxes — Lattice" },
      {
        name: "description",
        content:
          "File English words, meanings and extra details into vocabulary boxes and tick each one once you have studied it.",
      },
      { property: "og:title", content: "Vocabulary boxes — Lattice" },
      {
        property: "og:description",
        content: "Add words with meanings and extra boxes, then tick what you have studied.",
      },
    ],
  }),
  component: VocabularyPage,
});

function VocabularyPage() {
  const { entriesOf, addEntry, studiedCount, hydrated } = useStudy();
  const entries = entriesOf("vocab");
  const [word, setWord] = useState("");
  const [pos, setPos] = useState("");
  const [meaning, setMeaning] = useState("");

  const submit = () => {
    if (!word.trim()) return;
    addEntry("vocab", { word: word.trim(), pos: pos.trim(), meaning: meaning.trim() });
    setWord("");
    setPos("");
    setMeaning("");
  };

  const studiedHere = entries.filter((e) => e.studied).length;

  return (
    <section className="rise">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-none tracking-tight lg:text-5xl">
            Vocabulary
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Words you file into the box, one card at a time.
          </p>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {studiedHere} / {entries.length} ticked
        </span>
      </div>

      <div className="rounded-[18px] bg-surface p-4 ring-1 ring-black/5 lg:p-5">
        {hydrated && entries.length === 0 ? (
          <div className="mb-4 rounded-[12px] border border-dashed border-line p-8 text-center">
            <p className="font-medium text-ink">Your box is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first word below and it becomes a card you can tick once you know it.
            </p>
          </div>
        ) : null}

        <form
          className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1.2fr_1fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label
              className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
              htmlFor="v-w"
            >
              Word
            </label>
            <input
              id="v-w"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g. resolute"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/40 focus:outline-none"
            />
          </div>
          <div>
            <label
              className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
              htmlFor="v-p"
            >
              Part of speech
            </label>
            <input
              id="v-p"
              value={pos}
              onChange={(e) => setPos(e.target.value)}
              placeholder="adjective"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/40 focus:outline-none"
            />
          </div>
          <div>
            <label
              className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
              htmlFor="v-s"
            >
              Meaning
            </label>
            <input
              id="v-s"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="determined; unwavering"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/40 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[background,transform] duration-200 hover:bg-primary/90 active:scale-[0.98]"
          >
            Add box
          </button>
        </form>
      </div>

      {entries.length > 0 ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Your cards
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              tick a card when you know it · {studiedCount} ticked overall
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry, i) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                boxNumber={entries.length - i}
                title={entry.fields.word ?? "—"}
                badge={entry.fields.pos || undefined}
                body={entry.fields.meaning || undefined}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
