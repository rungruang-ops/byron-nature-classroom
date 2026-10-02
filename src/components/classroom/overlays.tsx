import { useEffect, useRef, useState } from "react";
import { FACTORS, FACTOR_MAP, LINES, QUIZ, type FactorId } from "./content";
import { CanIcon, ShovelIcon, SunIcon, WindIcon } from "./icons";
import { playSfx } from "./sfx";

const ICONS = {
  sun: SunIcon,
  water: CanIcon,
  soil: ShovelIcon,
  air: WindIcon,
} as const;

function Plant({ stage }: { stage: number }) {
  const stem = [150, 118, 96, 74, 58][stage] ?? 150;
  return (
    <svg viewBox="0 0 200 230" className="plant-svg" key={stage} aria-hidden="true">
      <ellipse cx="100" cy="214" rx="62" ry="10" fill="rgba(90,50,20,.18)" />
      <path d="M58 156h84l-8 46H66z" fill="#e07a3d" />
      <rect x="50" y="146" width="100" height="16" rx="6" fill="#c45e28" />
      <ellipse cx="100" cy="152" rx="42" ry="11" fill="#6b4424" />
      {stage === 0 && <ellipse cx="100" cy="148" rx="7" ry="5" fill="#e6c36a" />}
      {stage >= 1 && (
        <path
          d={`M100 150 C98 ${stem + 20} 102 ${stem + 8} 100 ${stem}`}
          fill="none"
          stroke="#2f9a45"
          strokeWidth="7"
          strokeLinecap="round"
        />
      )}
      {stage >= 1 && (
        <>
          <ellipse cx="86" cy={stem + 8} rx="16" ry="8" fill="#67d36a" transform={`rotate(-28 86 ${stem + 8})`} />
          <ellipse cx="116" cy={stem + 6} rx="16" ry="8" fill="#3cba55" transform={`rotate(26 116 ${stem + 6})`} />
        </>
      )}
      {stage >= 3 && (
        <>
          <ellipse cx="78" cy={stem + 28} rx="18" ry="9" fill="#49c45e" transform={`rotate(-40 78 ${stem + 28})`} />
          <ellipse cx="124" cy={stem + 26} rx="18" ry="9" fill="#7ee07a" transform={`rotate(36 124 ${stem + 26})`} />
        </>
      )}
      {stage >= 4 && (
        <g transform={`translate(100 ${stem})`}>
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} cx="0" cy="-14" rx="6" ry="12" fill="#fffdf8" transform={`rotate(${i * 45})`} />
          ))}
          <circle r="8" fill="#ffd23a" />
        </g>
      )}
    </svg>
  );
}

function FactorButton({
  id,
  done,
  onPress,
  onWarm,
}: {
  id: FactorId;
  done: boolean;
  onPress: (id: FactorId) => void;
  onWarm?: () => void;
}) {
  const factor = FACTOR_MAP[id];
  const Icon = ICONS[id];
  return (
    <button
      type="button"
      className={`factor factor-${id}${done ? " is-done" : ""}`}
      aria-pressed={done}
      onPointerDown={() => {
        if (!done) onWarm?.();
      }}
      onClick={() => onPress(id)}
    >
      <span className="factor-ico">
        <Icon />
      </span>
      <span className="factor-copy">
        <strong>{factor.title}</strong>
        <small>{done ? "ให้แล้ว" : factor.sub}</small>
      </span>
    </button>
  );
}

export function GrowOverlay({
  quizDone,
  onLearn,
  onComplete,
  onQuizStep,
  onQuizDone,
  onClose,
  say,
}: {
  quizDone: boolean;
  onLearn: (id: FactorId) => void;
  onComplete: () => void;
  onQuizStep: () => void;
  onQuizDone: () => void;
  onClose: () => void;
  say: (text: string) => void;
}) {
  const [applied, setApplied] = useState<FactorId[]>([]);
  const [phase, setPhase] = useState<"grow" | "quiz" | "cheer">("grow");
  const [fx, setFx] = useState<FactorId | null>(null);
  const [hint, setHint] = useState("แตะปัจจัยทั้ง 4 อย่าง ดูต้นไม้โตทีละขั้น");
  const [qIndex, setQIndex] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const quizDoneRef = useRef(quizDone);
  quizDoneRef.current = quizDone;

  useEffect(() => {
    if (applied.length < 4) return;
    const timer = window.setTimeout(() => setPhase(quizDoneRef.current ? "cheer" : "quiz"), 700);
    return () => window.clearTimeout(timer);
  }, [applied.length]);

  function give(id: FactorId) {
    if (phase !== "grow") return;
    if (applied.includes(id)) {
      playSfx("no");
      setHint("อันนี้ให้แล้ว ลองปัจจัยอื่นสิ!");
      return;
    }
    const next = [...applied, id];
    setApplied(next);
    setFx(id);
    window.setTimeout(() => setFx(null), 900);
    onLearn(id);
    const left = 4 - next.length;
    if (left === 0) {
      onComplete();
      playSfx("win");
      setHint("ครบแล้ว! ดูดอกไม้บาน");
      say(LINES.bloom);
      return;
    }
    playSfx("grow");
    setHint(`${FACTOR_MAP[id].line} เหลืออีก ${left}`);
    say(FACTOR_MAP[id].line);
  }

  function answer(choice: number) {
    const card = QUIZ[qIndex];
    if (!card) return;
    if (choice !== card.ok) {
      setWrong(choice);
      playSfx("no");
      say(LINES.wrong);
      return;
    }
    setWrong(null);
    onQuizStep();
    playSfx("grow");
    if (qIndex + 1 >= QUIZ.length) {
      onQuizDone();
      setPhase("cheer");
      say(LINES.quiz);
      return;
    }
    setQIndex(qIndex + 1);
  }

  const card = QUIZ[qIndex];

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="ปลูกต้นไม้">
      <div className={`sheet grow-sheet${wrong !== null ? " is-shake" : ""}`}>
        <div className="sheet-head">
          <h2>สำรวจปัจจัยการเจริญเติบโตของพืช</h2>
          <button type="button" className="text-btn" onClick={onClose}>
            ปิด
          </button>
        </div>
        <p className="hint">{hint}</p>
        <div className={`plant-stage fx-${fx ?? "none"}`}>
          <Plant stage={Math.min(4, applied.length)} />
          {fx === "water" && (
            <div className="drops" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <i key={i} style={{ left: `${18 + i * 12}%`, animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
          )}
          {fx === "sun" && <div className="rays" aria-hidden="true" />}
          {fx === "air" && <div className="gusts" aria-hidden="true" />}
          {fx === "soil" && (
            <div className="crumbs" aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <i key={i} style={{ left: `${28 + i * 10}%` }} />
              ))}
            </div>
          )}
        </div>
        <p className="pips" aria-label={`ให้ปัจจัยแล้ว ${applied.length} จาก 4`}>
          {FACTORS.map((factor) => (
            <span key={factor.id} className={applied.includes(factor.id) ? "pip on" : "pip"} />
          ))}
        </p>
        {phase === "grow" && (
          <div className="factor-grid">
            {FACTORS.map((factor) => (
              <FactorButton
                key={factor.id}
                id={factor.id}
                done={applied.includes(factor.id)}
                onWarm={() => say(factor.line)}
                onPress={give}
              />
            ))}
          </div>
        )}
        {phase === "quiz" && card && (
          <div className="quiz">
            <p className="quiz-kicker">ตรวจสอบความเข้าใจ {qIndex + 1}/3</p>
            <p className="quiz-q">{card.q}</p>
            <div className="quiz-choices">
              {card.choices.map((choice, index) => (
                <button
                  key={choice}
                  type="button"
                  className={`choice${wrong === index ? " is-wrong" : ""}`}
                  onClick={() => answer(index)}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        )}
        {phase === "cheer" && (
          <div className="cheer">
            <div className="confetti" aria-hidden="true">
              {Array.from({ length: 14 }, (_, i) => (
                <i key={i} className={`bit b${i % 4}`} style={{ left: `${(i * 7) % 100}%`, animationDelay: `${i * 0.05}s` }} />
              ))}
            </div>
            <p>เยี่ยมมาก! ต้นไม้ได้รับแสง น้ำ ดิน และอากาศครบแล้ว</p>
            <button type="button" className="go" onClick={onClose}>
              กลับห้องเรียน
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const SPOTS = [
  { x: "8%", y: "58%" },
  { x: "28%", y: "72%" },
  { x: "46%", y: "54%" },
  { x: "62%", y: "76%" },
  { x: "78%", y: "58%" },
];

export function FlowerOverlay({
  already,
  onClear,
  onClose,
  say,
}: {
  already: boolean;
  onClear: () => void;
  onClose: () => void;
  say: (text: string) => void;
}) {
  const [picked, setPicked] = useState<number[]>([]);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="เก็บดอกไม้">
      <div className="sheet flower-sheet">
        <div className="sheet-head">
          <h2>เก็บดอกไม้ในทุ่ง</h2>
          <button type="button" className="text-btn" onClick={onClose}>
            ปิด
          </button>
        </div>
        <p className="hint">แตะดอกไม้ให้ครบ 5 ดอก {picked.length}/5</p>
        <div className="meadow-play">
          {SPOTS.map((spot, index) => (
            <button
              key={index}
              type="button"
              className={`bloom${picked.includes(index) ? " is-picked" : ""}`}
              style={{ left: spot.x, top: spot.y }}
              onClick={() => {
                if (picked.includes(index)) return;
                const next = [...picked, index];
                setPicked(next);
                if (next.length === 5) {
                  onClear();
                  playSfx("win");
                  say(already ? LINES.again : LINES.flowers);
                  return;
                }
                playSfx("tap");
              }}
              aria-label={`ดอกไม้ที่ ${index + 1}`}
            >
              <i />
            </button>
          ))}
        </div>
        {picked.length >= 5 && (
          <button type="button" className="go" onClick={onClose}>
            เยี่ยมมาก!
          </button>
        )}
      </div>
    </div>
  );
}

