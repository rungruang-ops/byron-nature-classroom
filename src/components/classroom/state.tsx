import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { FactorId } from "./content";

const KEY = "moopui-nature-classroom-v1";

export type Save = {
  score: number;
  level: number;
  progress: number;
  learned: FactorId[];
  garden: number;
  grows: number;
  quizDone: boolean;
  flowerClear: boolean;
  voice: boolean;
  sfx: boolean;
  music: boolean;
};

export const INITIAL: Save = {
  score: 0,
  level: 1,
  progress: 0,
  learned: [],
  garden: 0,
  grows: 0,
  quizDone: false,
  flowerClear: false,
  voice: true,
  sfx: true,
  music: false,
};

const FACTOR_IDS: FactorId[] = ["sun", "water", "soil", "air"];

function sanitize(raw: unknown): Save {
  if (!raw || typeof raw !== "object") return INITIAL;
  const data = raw as Partial<Save>;
  const learned = Array.isArray(data.learned)
    ? data.learned.filter((id): id is FactorId => FACTOR_IDS.includes(id as FactorId))
    : [];
  return {
    ...INITIAL,
    ...data,
    learned,
    score: num(data.score, INITIAL.score),
    level: num(data.level, INITIAL.level),
    progress: clamp(num(data.progress, INITIAL.progress), 0, 100),
    garden: clamp(num(data.garden, 0), 0, 6),
    grows: num(data.grows, 0),
    quizDone: Boolean(data.quizDone),
    flowerClear: Boolean(data.flowerClear),
    voice: data.voice !== false,
    sfx: data.sfx !== false,
    music: Boolean(data.music),
  };
}

function num(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Reaching 100% levels up and leaves the bar full (so the last sprout lights);
 * the next gain starts the new level's bar from zero.
 */
function withGains(save: Save, scoreAdd: number, progAdd: number): Save {
  let progress = (save.progress >= 100 ? 0 : save.progress) + progAdd;
  let level = save.level;
  if (progress >= 100) {
    progress = 100;
    level += 1;
  }
  return { ...save, score: save.score + scoreAdd, progress, level };
}

type Api = {
  save: Save;
  ready: boolean;
  toast: string | null;
  patch: (partial: Partial<Save>) => void;
  learn: (id: FactorId) => void;
  completeGrow: () => void;
  awardQuizStep: () => void;
  finishQuiz: () => void;
  clearFlowers: () => void;
  reset: () => void;
};

const Ctx = createContext<Api | null>(null);

export function ClassroomProvider({ children }: { children: ReactNode }) {
  const [save, setSave] = useState<Save>(INITIAL);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const saveRef = useRef(save);
  const toastTimer = useRef(0);
  saveRef.current = save;

  const pushToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1700);
  }, []);

  const commit = useCallback(
    (next: Save, note?: string) => {
      const prev = saveRef.current;
      saveRef.current = next;
      setSave(next);
      if (next.level > prev.level) pushToast(`เลื่อนเป็นระดับ ${next.level}!`);
      else if (note) pushToast(note);
    },
    [pushToast],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const next = sanitize(JSON.parse(raw));
        saveRef.current = next;
        setSave(next);
      }
    } catch {
      /* keep the cheerful defaults */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(save));
    } catch {
      /* storage full or unavailable (e.g. private mode): keep playing unsaved */
    }
  }, [save, ready]);

  const api: Api = {
    save,
    ready,
    toast,
    patch: (partial) => commit({ ...saveRef.current, ...partial }),
    learn: (id) => {
      const prev = saveRef.current;
      const known = prev.learned.includes(id);
      const next = withGains(prev, known ? 4 : 15, known ? 0 : 5);
      next.learned = known ? prev.learned : [...prev.learned, id];
      commit(next, known ? undefined : "+15 คะแนนสะสม");
    },
    completeGrow: () => {
      const prev = saveRef.current;
      const first = prev.grows === 0;
      const next = withGains(prev, first ? 20 : 8, first ? 8 : 2);
      next.grows = prev.grows + 1;
      next.garden = Math.min(6, prev.garden + 1);
      commit(next, prev.garden >= 6 ? "สวนเต็มแล้ว ไบรอั่นดีใจมาก!" : first ? "ดอกไม้บาน! +20" : "ปลูกเพิ่มอีกต้น!");
    },
    awardQuizStep: () => {
      if (saveRef.current.quizDone) return;
      commit(withGains(saveRef.current, 10, 3), "+10");
    },
    finishQuiz: () => {
      if (saveRef.current.quizDone) return;
      commit({ ...saveRef.current, quizDone: true });
    },
    clearFlowers: () => {
      if (saveRef.current.flowerClear) return;
      commit({ ...withGains(saveRef.current, 20, 6), flowerClear: true }, "เก็บดอกไม้ครบ! +20");
    },
    reset: () => commit({ ...INITIAL }, "เริ่มต้นใหม่แล้ว"),
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useClassroom() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Classroom missing");
  return ctx;
}
