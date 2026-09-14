import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useStudy } from "@/lib/study-store";

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/vocabulary", label: "Vocabulary" },
  { to: "/grammar", label: "Grammar" },
  { to: "/notes", label: "Notes" },
  { to: "/quiz", label: "Quiz" },
] as const;

export function StudyShell({ children }: { children: ReactNode }) {
  const { streak, progress, studiedCount, totalCount, lastSessionLabel, quizStatus } = useStudy();

  return (
    <div className="min-h-screen bg-paper font-body text-ink antialiased">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-display text-2xl leading-none tracking-tight">Lattice</span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
                English study companion
              </span>
            </div>
            <nav className="flex items-center gap-1 overflow-x-auto text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="shrink-0 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-ink"
                  activeProps={{ className: "bg-ink text-paper font-medium hover:text-paper" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-wrap items-end gap-6 border-t border-line/70 py-3 lg:gap-10">
            <div className="rise flex items-baseline gap-2">
              <span className="font-display text-3xl leading-none text-primary">{streak}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                day streak
              </span>
            </div>
            <div className="rise min-w-[180px] flex-1 sm:max-w-xs">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Overall progress
                </span>
                <span className="font-mono text-[11px] font-medium">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-line/80">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                {studiedCount} of {totalCount} boxes ticked
              </span>
            </div>
            <div className="rise hidden sm:block">
              <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Last session
              </span>
              <span className="text-sm font-medium">{lastSessionLabel}</span>
            </div>
            <div className="rise hidden sm:block">
              <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Quiz status
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                <span
                  className={`size-1.5 rounded-full ${quizStatus.ready ? "bg-primary" : "bg-muted-foreground"}`}
                />
                {quizStatus.label}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-10">
        {children}
        <footer className="mt-16 flex flex-col items-start justify-between gap-2 border-t border-line pt-6 sm:flex-row sm:items-center">
          <span className="font-mono text-[11px] text-muted-foreground">
            Your progress is kept privately on this device.
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            Lattice · made for steady study
          </span>
        </footer>
      </main>
    </div>
  );
}
