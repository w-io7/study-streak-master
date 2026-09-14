import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type EntryKind = "vocab" | "grammar" | "note";

export type ExtraField = { id: string; label: string; value: string };

export type Entry = {
  id: string;
  kind: EntryKind;
  fields: Record<string, string>;
  extras: ExtraField[];
  studied: boolean;
  createdAt: string;
  studiedAt: string | null;
};

export type QuizResult = {
  id: string;
  takenAt: string;
  score: number;
  total: number;
};

export type StudyState = {
  entries: Entry[];
  sessionDays: string[];
  lastSessionAt: string | null;
  quizzes: QuizResult[];
};

const STORAGE_KEY = "lattice.study.v1";

const emptyState: StudyState = {
  entries: [],
  sessionDays: [],
  lastSessionAt: null,
  quizzes: [],
};

function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function read(): StudyState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as Partial<StudyState>;
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      sessionDays: Array.isArray(parsed.sessionDays) ? parsed.sessionDays : [],
      lastSessionAt: typeof parsed.lastSessionAt === "string" ? parsed.lastSessionAt : null,
      quizzes: Array.isArray(parsed.quizzes) ? parsed.quizzes : [],
    };
  } catch {
    return emptyState;
  }
}

export function computeStreak(sessionDays: string[]) {
  if (sessionDays.length === 0) return 0;
  const days = new Set(sessionDays);
  const today = new Date();
  if (!days.has(dayKey(today))) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (!days.has(dayKey(yesterday))) return 0;
    today.setDate(today.getDate() - 1);
  }
  let streak = 0;
  const cursor = new Date(today);
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

type StudyContextValue = {
  hydrated: boolean;
  state: StudyState;
  entriesOf: (kind: EntryKind) => Entry[];
  addEntry: (kind: EntryKind, fields: Record<string, string>) => void;
  removeEntry: (id: string) => void;
  toggleStudied: (id: string) => void;
  addExtraField: (id: string, label: string, value: string) => void;
  removeExtraField: (entryId: string, extraId: string) => void;
  recordQuiz: (score: number, total: number) => void;
  streak: number;
  progress: number;
  studiedCount: number;
  totalCount: number;
  lastSessionLabel: string;
  quizStatus: { label: string; ready: boolean };
};

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState((current) => (current === emptyState ? read() : current));

    setHydrated(true);
  }, []);

  const persist = useCallback((next: StudyState) => {
    setState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const touchSession = useCallback((current: StudyState): StudyState => {
    const today = dayKey();
    return {
      ...current,
      lastSessionAt: new Date().toISOString(),
      sessionDays: current.sessionDays.includes(today)
        ? current.sessionDays
        : [...current.sessionDays, today],
    };
  }, []);

  const addEntry = useCallback(
    (kind: EntryKind, fields: Record<string, string>) => {
      setState((current) => {
        const entry: Entry = {
          id: newId(),
          kind,
          fields,
          extras: [],
          studied: false,
          createdAt: new Date().toISOString(),
          studiedAt: null,
        };
        const next = touchSession({ ...current, entries: [entry, ...current.entries] });
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [touchSession],
  );

  const removeEntry = useCallback(
    (id: string) => {
      persist({ ...state, entries: state.entries.filter((e) => e.id !== id) });
    },
    [persist, state],
  );

  const toggleStudied = useCallback(
    (id: string) => {
      setState((current) => {
        const entries = current.entries.map((e) =>
          e.id === id
            ? { ...e, studied: !e.studied, studiedAt: !e.studied ? new Date().toISOString() : null }
            : e,
        );
        const target = current.entries.find((e) => e.id === id);
        const base = { ...current, entries };
        const next = target && !target.studied ? touchSession(base) : base;
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [touchSession],
  );

  const addExtraField = useCallback(
    (id: string, label: string, value: string) => {
      persist({
        ...state,
        entries: state.entries.map((e) =>
          e.id === id
            ? { ...e, extras: [...e.extras, { id: newId(), label, value }] }
            : e,
        ),
      });
    },
    [persist, state],
  );

  const removeExtraField = useCallback(
    (entryId: string, extraId: string) => {
      persist({
        ...state,
        entries: state.entries.map((e) =>
          e.id === entryId ? { ...e, extras: e.extras.filter((x) => x.id !== extraId) } : e,
        ),
      });
    },
    [persist, state],
  );

  const recordQuiz = useCallback(
    (score: number, total: number) => {
      setState((current) => {
        const next = touchSession({
          ...current,
          quizzes: [
            { id: newId(), takenAt: new Date().toISOString(), score, total },
            ...current.quizzes,
          ],
        });
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [touchSession],
  );

  const value = useMemo<StudyContextValue>(() => {
    const totalCount = state.entries.length;
    const studiedCount = state.entries.filter((e) => e.studied).length;
    const progress = totalCount === 0 ? 0 : Math.round((studiedCount / totalCount) * 100);
    const material = state.entries.filter((e) => e.kind !== "note").length;
    const lastQuiz = state.quizzes[0];

    let lastSessionLabel = "No session yet";
    if (state.lastSessionAt) {
      const when = new Date(state.lastSessionAt);
      const diffMin = Math.round((Date.now() - when.getTime()) / 60000);
      if (diffMin < 1) lastSessionLabel = "Just now";
      else if (diffMin < 60) lastSessionLabel = `${diffMin} min ago`;
      else if (dayKey(when) === dayKey())
        lastSessionLabel = `Today, ${when.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
      else
        lastSessionLabel = when.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        }) + `, ${when.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    }

    const quizStatus = lastQuiz
      ? {
          label: `${lastQuiz.score}/${lastQuiz.total} last attempt`,
          ready: material >= 3,
        }
      : { label: material >= 3 ? "Ready to start" : "Not ready", ready: material >= 3 };

    return {
      hydrated,
      state,
      entriesOf: (kind: EntryKind) => state.entries.filter((e) => e.kind === kind),
      addEntry,
      removeEntry,
      toggleStudied,
      addExtraField,
      removeExtraField,
      recordQuiz,
      streak: computeStreak(state.sessionDays),
      progress,
      studiedCount,
      totalCount,
      lastSessionLabel,
      quizStatus,
    };
  }, [
    addEntry,
    addExtraField,
    hydrated,
    recordQuiz,
    removeEntry,
    removeExtraField,
    state,
    toggleStudied,
  ]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used inside StudyProvider");
  return ctx;
}
