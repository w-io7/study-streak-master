import { useState } from "react";

import { useStudy, type Entry } from "@/lib/study-store";

function TickButton({ studied, onClick }: { studied: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={studied}
      title={studied ? "Studied — click to untick" : "Mark as studied"}
      className={`inline-flex size-7 shrink-0 items-center justify-center rounded-md border text-sm transition-[background,color,transform] duration-200 active:scale-95 ${
        studied
          ? "border-primary bg-primary text-primary-foreground"
          : "border-line bg-paper text-muted-foreground hover:border-primary/50 hover:text-ink"
      }`}
    >
      <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
        <path
          d="M4.5 10.5l3.5 3.5 7.5-8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">{studied ? "Studied" : "Not studied yet"}</span>
    </button>
  );
}

export function EntryCard({
  entry,
  boxNumber,
  title,
  badge,
  body,
}: {
  entry: Entry;
  boxNumber: number;
  title: string;
  badge?: string | undefined;
  body?: string | undefined;
}) {

  const { toggleStudied, addExtraField, removeExtraField, removeEntry } = useStudy();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  const submitExtra = () => {
    if (!label.trim() && !value.trim()) return;
    addExtraField(entry.id, label.trim() || "Note", value.trim());
    setLabel("");
    setValue("");
    setOpen(false);
  };

  return (
    <div className="rise rounded-[14px] bg-surface p-4 ring-1 ring-black/5 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:ring-black/10">
      <div className="flex items-start justify-between gap-2">
        <span className="font-display text-2xl leading-none break-words">{title}</span>
        <div className="flex items-center gap-2">
          {badge ? <span className="font-mono text-[10px] text-muted-foreground">{badge}</span> : null}
          <TickButton studied={entry.studied} onClick={() => toggleStudied(entry.id)} />
        </div>
      </div>

      {body ? <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">{body}</p> : null}

      {entry.extras.length > 0 ? (
        <dl className="mt-3 space-y-1.5">
          {entry.extras.map((extra) => (
            <div key={extra.id} className="flex items-start justify-between gap-2">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {extra.label}
                </dt>
                <dd className="text-sm whitespace-pre-wrap">{extra.value}</dd>
              </div>
              <button
                type="button"
                onClick={() => removeExtraField(entry.id, extra.id)}
                className="font-mono text-[10px] text-muted-foreground hover:text-primary"
              >
                remove
              </button>
            </div>
          ))}
        </dl>
      ) : null}

      {open ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="label (e.g. example)"
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/40 focus:outline-none"
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitExtra();
            }}
            placeholder="what goes in this extra box"
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={submitExtra}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[background,transform] duration-200 hover:bg-primary/90 active:scale-[0.98]"
          >
            Save
          </button>
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <span className="font-mono text-[10px] text-muted-foreground">
          Box {String(boxNumber).padStart(3, "0")} · {entry.studied ? "studied" : "new"}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="font-mono text-[10px] text-muted-foreground hover:text-ink"
          >
            {open ? "cancel" : "+ extra box"}
          </button>
          <button
            type="button"
            onClick={() => removeEntry(entry.id)}
            className="font-mono text-[10px] text-muted-foreground hover:text-primary"
          >
            delete
          </button>
        </div>
      </div>
    </div>
  );
}
