import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { EntryCard } from "@/components/EntryCard";
import { useStudy } from "@/lib/study-store";

export const Route = createFileRoute("/grammar")({
  head: () => ({
    meta: [
      { title: "Grammar rules — Lattice" },
      {
        name: "description",
        content:
          "Save English grammar rules with short explanations and extra boxes, and tick each rule once you have studied it.",
      },
      { property: "og:title", content: "Grammar rules — Lattice" },
      {
        property: "og:description",
        content: "Keep tenses and patterns in rule boxes you can tick as you learn them.",
      },
    ],
  }),
  component: GrammarPage,
});

function GrammarPage() {
  const { entriesOf, addEntry, hydrated } = useStudy();
  const entries = entriesOf("grammar");
  const [rule, setRule] = useState("");
  const [brief, setBrief] = useState("");

  const submit = () => {
    if (!rule.trim()) return;
    addEntry("grammar", { rule: rule.trim(), brief: brief.trim() });
    setRule("");
    setBrief("");
  };

  const studiedHere = entries.filter((e) => e.studied).length;

  return (
    <section className="rise">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-none tracking-tight lg:text-5xl">Grammar</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Rules, filed the same way.</p>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {studiedHere} / {entries.length} ticked
        </span>
      </div>

      <div className="rounded-[18px] bg-surface p-4 ring-1 ring-black/5 lg:p-5">
        {hydrated && entries.length === 0 ? (
          <div className="mb-4 rounded-[12px] border border-dashed border-line p-8 text-center">
            <p className="font-medium text-ink">No rules saved yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a rule box below to start building your grammar set.
            </p>
          </div>
        ) : null}

        <form
          className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1.4fr_1.6fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label
              className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
              htmlFor="g-t"
            >
              Rule
            </label>
            <input
              id="g-t"
              value={rule}
              onChange={(e) => setRule(e.target.value)}
              placeholder="e.g. Present perfect"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/40 focus:outline-none"
            />
          </div>
          <div>
            <label
              className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
              htmlFor="g-b"
            >
              Brief explanation
            </label>
            <input
              id="g-b"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="have / has + past participle"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/40 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-md border border-line bg-paper px-4 py-2 text-sm font-semibold transition-[background,transform] duration-200 hover:bg-line/40 active:scale-[0.98]"
          >
            Add box
          </button>
        </form>

        {entries.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {entries.map((entry, i) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                boxNumber={entries.length - i}
                title={entry.fields.rule ?? "—"}
                badge="Rule"
                body={entry.fields.brief || undefined}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
