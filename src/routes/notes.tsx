import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { EntryCard } from "@/components/EntryCard";
import { useStudy } from "@/lib/study-store";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "General notes — Lattice" },
      {
        name: "description",
        content:
          "Write general English study notes, phrases and reminders into note boxes, and tick them off as you review.",
      },
      { property: "og:title", content: "General notes — Lattice" },
      {
        property: "og:description",
        content: "A quiet page for doubts, phrases and reminders that don't fit a card.",
      },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { entriesOf, addEntry, hydrated } = useStudy();
  const entries = entriesOf("note");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const submit = () => {
    if (!title.trim() && !text.trim()) return;
    addEntry("note", { title: title.trim() || "Note", text: text.trim() });
    setTitle("");
    setText("");
  };

  const studiedHere = entries.filter((e) => e.studied).length;

  return (
    <section className="rise">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-none tracking-tight lg:text-5xl">Notes</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Anything that doesn't fit a card goes here.
          </p>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {studiedHere} / {entries.length} ticked
        </span>
      </div>

      <div className="rounded-[18px] bg-surface p-4 ring-1 ring-black/5 lg:p-5">
        {hydrated && entries.length === 0 ? (
          <div className="mb-4 rounded-[12px] border border-dashed border-line p-8 text-center">
            <p className="font-display text-2xl tracking-tight">Nothing written yet</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
              A clean page. Jot a grammar doubt, a phrase you overheard, or a translation quirk.
            </p>
          </div>
        ) : null}

        <form
          className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_2fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label
              className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
              htmlFor="n-t"
            >
              Title
            </label>
            <input
              id="n-t"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. phrases from a podcast"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/40 focus:outline-none"
            />
          </div>
          <div>
            <label
              className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
              htmlFor="n-b"
            >
              Note
            </label>
            <textarea
              id="n-b"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              placeholder="write it as you heard it"
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/40 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.98]"
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
                title={entry.fields.title ?? "Note"}
                body={entry.fields.text || undefined}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
