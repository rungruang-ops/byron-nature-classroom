import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CHARACTER,
  DEFAULT_LINE,
  FACTORS,
  INTRO_LINE,
  LINES,
  NAV,
  poseFor,
  type FactorId,
  type ViewId,
} from "./content";
import {
  BarnIcon,
  CanIcon,
  ChatIcon,
  GearIcon,
  HelpIcon,
  LeafIcon,
  MapIcon,
  MusicIcon,
  NotebookIcon,
  PigFallback,
  ShovelIcon,
  SpeakerIcon,
  SproutIcon,
  StarIcon,
  SunIcon,
  ToolboxIcon,
  WindIcon,
} from "./icons";
import { FlowerOverlay, GrowOverlay } from "./overlays";
import { installAudioUnlock, playSfx, setMusicEnabled, setSfxEnabled, speak, unlockAudio } from "./sfx";
import { ClassroomProvider, useClassroom } from "./state";

const NAV_ICONS = {
  home: BarnIcon,
  missions: MapIcon,
  garden: SproutIcon,
  notes: NotebookIcon,
  kit: ToolboxIcon,
} as const;

const FACTOR_ICONS = {
  sun: SunIcon,
  water: CanIcon,
  soil: ShovelIcon,
  air: WindIcon,
} as const;

function Art({
  src,
  alt,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
}) {
  const [ok, setOk] = useState(true);
  if (!ok) return fallback ? <>{fallback}</> : null;
  return <img src={src} alt={alt} className={className} draggable={false} onError={() => setOk(false)} />;
}

function Byron({ onGreet, pose }: { onGreet: (early: boolean) => void; pose: string }) {
  const [ok, setOk] = useState(true);
  const motion = pose ? `pig pose-${pose}` : "pig";
  return (
    <button
      type="button"
      className="pig-wrap"
      onPointerDown={() => onGreet(true)}
      onClick={() => onGreet(false)}
      aria-label={`${CHARACTER} ทักทาย`}
    >
      {ok ? (
        <img
          src="/assets/moopui.png"
          alt={CHARACTER}
          className={motion}
          draggable={false}
          onError={() => setOk(false)}
        />
      ) : (
        <PigFallback className={motion} />
      )}
      <span className="pig-name">{CHARACTER}</span>
    </button>
  );
}

export function ClassroomApp() {
  return (
    <ClassroomProvider>
      <Desk />
    </ClassroomProvider>
  );
}

function Desk() {
  const api = useClassroom();
  const { save } = api;
  const [view, setView] = useState<ViewId>("home");
  const [overlay, setOverlay] = useState<"grow" | "flowers" | "settings" | "help" | null>(null);
  const [line, setLine] = useState(DEFAULT_LINE);
  const [picked, setPicked] = useState<FactorId | null>(null);
  const [armReset, setArmReset] = useState(false);
  const [audioHint, setAudioHint] = useState<string | null>(null);
  const [pose, setPose] = useState("");
  const poseTimer = useRef(0);

  useEffect(() => installAudioUnlock(), []);
  useEffect(() => {
    const fail = () => setAudioHint("เปิดเสียงลำโพง แล้วแตะไบรอั่นอีกครั้ง");
    const ok = () => setAudioHint(null);
    window.addEventListener("byron-audio-fail", fail);
    window.addEventListener("byron-audio-ok", ok);
    return () => {
      window.removeEventListener("byron-audio-fail", fail);
      window.removeEventListener("byron-audio-ok", ok);
    };
  }, []);
  useEffect(() => setSfxEnabled(save.sfx), [save.sfx]);
  useEffect(() => {
    const wake = () => {
      if (save.music) setMusicEnabled(true);
    };
    window.addEventListener("pointerdown", wake);
    return () => window.removeEventListener("pointerdown", wake);
  }, [save.music]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOverlay(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function say(text: string) {
    setLine(text);
    setPose(poseFor(text));
    window.clearTimeout(poseTimer.current);
    poseTimer.current = window.setTimeout(() => setPose(""), 2400);
    if (!save.voice) {
      setAudioHint("เสียงพูดปิดอยู่ กดปุ่มแชทมุมล่างขวา");
      return;
    }
    speak(text, true);
  }

  function go(next: ViewId) {
    setView(next);
    setOverlay(null);
    playSfx("nav");
    if (next === "home") setLine(DEFAULT_LINE);
  }

  function toggle(key: "voice" | "sfx" | "music") {
    const next = !save[key];
    if (key === "sfx") setSfxEnabled(next);
    if (key === "music") setMusicEnabled(next);
    api.patch({ [key]: next });
    if (next && (key === "sfx" || save.sfx)) playSfx("tap");
    if (key === "voice" && next) speak(line, true);
  }

  const chapter = Math.max(1, save.level - 4);
  const chapterName = chapter === 1 ? "พื้นฐาน" : "สำรวจต่อ";

  return (
    <div className="desk">
      <Art src="/assets/compass.png" alt="" className="prop prop-compass" />
      <Art src="/assets/magnifier.png" alt="" className="prop prop-glass" />
      <Art src="/assets/gear.png" alt="" className="prop prop-gear" />
      <Art src="/assets/eraser.png" alt="" className="prop prop-eraser" />
      <div className="tablet">
        <div className="screen">
          <nav className="sidebar" aria-label="เมนูห้องเรียน">
            {NAV.map((item) => {
              const Icon = NAV_ICONS[item.id];
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={active ? "nav-btn is-active" : "nav-btn"}
                  aria-current={active ? "page" : undefined}
                  onClick={() => go(item.id)}
                >
                  <span className="nav-ico">
                    <Icon />
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="stage">
            <div className="stage-bg" />
            <header className="topbar">
              <h1 className="banner">
                <LeafIcon className="leaf" />
                <span className="banner-text">
                  <span>ห้องเรียนธรรมชาติ</span>
                  <span>ของ {CHARACTER}</span>
                </span>
                <LeafIcon className="leaf flip" />
              </h1>
              <div className="status">
                <span className="badge score">
                  <StarIcon />
                  <span>คะแนนสะสม: {save.score}</span>
                </span>
                <span className="badge level">ระดับ: {save.level}</span>
                <span className="avatar" aria-hidden="true">
                  <Art src="/assets/moopui.png" alt="" fallback={<PigFallback />} />
                </span>
                <button type="button" className="icon-btn" aria-label="ตั้งค่า" onClick={() => { setOverlay("settings"); setArmReset(false); playSfx("nav"); }}>
                  <GearIcon />
                </button>
                <button type="button" className="icon-btn" aria-label="วิธีเล่น" onClick={() => { setOverlay("help"); playSfx("nav"); }}>
                  <HelpIcon />
                </button>
              </div>
            </header>
            <div className="stage-body">
              {view === "home" && (
                <div className="home">
                  <div className="hero">
                    <p className="speech" key={line}>
                      {line}
                    </p>
                    <Byron
                      pose={pose}
                      onGreet={(early) => {
                        unlockAudio();
                        if (!early) playSfx("tap");
                        say(INTRO_LINE);
                      }}
                    />
                  </div>
                  <section className="panel" aria-label="ภารกิจปลูกพืช">
                    <h2>
                      สำรวจปัจจัยการเจริญเติบโตของพืช
                      <small>▾</small>
                    </h2>
                    <div className="factor-grid">
                      {FACTORS.map((factor) => {
                        const Icon = FACTOR_ICONS[factor.id];
                        const on = picked === factor.id;
                        return (
                          <button
                            key={factor.id}
                            type="button"
                            className={`factor factor-${factor.id}${on ? " is-on" : ""}`}
                            aria-pressed={on}
                            onPointerDown={() => {
                              unlockAudio();
                              say(factor.line);
                            }}
                            onClick={() => {
                              setPicked(factor.id);
                              say(factor.line);
                              playSfx("tap");
                            }}
                          >
                            <span className="factor-ico">
                              <Icon />
                            </span>
                            <span className="factor-copy">
                              <strong>{factor.title}</strong>
                              <small>{factor.sub}</small>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      className="go"
                      onPointerDown={() => {
                        unlockAudio();
                        say(LINES.go);
                      }}
                      onClick={() => {
                        setOverlay("grow");
                        playSfx("tap");
                        say(LINES.go);
                      }}
                    >
                      เริ่มเลย!
                    </button>
                  </section>
                </div>
              )}
              {view === "missions" && <Missions onGrow={() => setOverlay("grow")} onFlowers={() => setOverlay("flowers")} onView={go} />}
              {view === "garden" && <Garden count={save.garden} />}
              {view === "notes" && <Notes learned={save.learned} />}
              {view === "kit" && <Kit save={save} />}
            </div>
            <footer className="dock">
              <span className="chapter">
                บทที่ {chapter}: {chapterName}
              </span>
              <div
                className="track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={save.progress}
                aria-label="ความคืบหน้าบทเรียน"
              >
                <div className="fill" style={{ width: `${save.progress}%` }} />
                {[33, 66, 100].map((mark) => (
                  <span key={mark} className={save.progress >= mark ? "sprout lit" : "sprout"} style={{ left: `${mark}%` }}>
                    <SproutIcon />
                  </span>
                ))}
              </div>
              <span className="pct">{save.progress}%</span>
              <div className="audio">
                <button type="button" className={save.voice ? "round talk on" : "round talk"} aria-pressed={save.voice} aria-label="เสียงพูดของไบรอั่น" onClick={() => toggle("voice")}>
                  <ChatIcon />
                </button>
                <button type="button" className={save.sfx ? "round sfx on" : "round sfx"} aria-pressed={save.sfx} aria-label="เสียงเอฟเฟกต์" onClick={() => toggle("sfx")}>
                  <SpeakerIcon />
                </button>
                <button type="button" className={save.music ? "round music on" : "round music"} aria-pressed={save.music} aria-label="เพลง" onClick={() => toggle("music")}>
                  <MusicIcon />
                </button>
              </div>
            </footer>
            {(audioHint || api.toast) && <p className="toast">{audioHint ?? api.toast}</p>}
          </div>
          {overlay === "grow" && (
            <GrowOverlay
              quizDone={save.quizDone}
              onLearn={api.learn}
              onComplete={api.completeGrow}
              onQuizStep={api.awardQuizStep}
              onQuizDone={api.finishQuiz}
              onClose={() => setOverlay(null)}
              say={say}
            />
          )}
          {overlay === "flowers" && (
            <FlowerOverlay
              already={save.flowerClear}
              onClear={api.clearFlowers}
              onClose={() => setOverlay(null)}
              say={say}
            />
          )}
          {overlay === "settings" && (
            <div className="overlay" role="dialog" aria-modal="true" aria-label="ตั้งค่า">
              <div className="sheet">
                <div className="sheet-head">
                  <h2>ตั้งค่า</h2>
                  <button type="button" className="text-btn" onClick={() => setOverlay(null)}>
                    ปิด
                  </button>
                </div>
                <div className="settings">
                  <button type="button" className="choice" aria-pressed={save.voice} onClick={() => toggle("voice")}>
                    เสียงพูดของไบรอั่น: {save.voice ? "เปิด" : "ปิด"}
                  </button>
                  <button type="button" className="choice" aria-pressed={save.sfx} onClick={() => toggle("sfx")}>
                    เสียงเอฟเฟกต์: {save.sfx ? "เปิด" : "ปิด"}
                  </button>
                  <button type="button" className="choice" aria-pressed={save.music} onClick={() => toggle("music")}>
                    เพลงประกอบ: {save.music ? "เปิด" : "ปิด"}
                  </button>
                  {armReset ? (
                    <button
                      type="button"
                      className="choice danger"
                      onClick={() => {
                        api.reset();
                        setArmReset(false);
                        setView("home");
                        setLine(DEFAULT_LINE);
                        setOverlay(null);
                      }}
                    >
                      ยืนยันล้างความคืบหน้า
                    </button>
                  ) : (
                    <button type="button" className="choice" onClick={() => setArmReset(true)}>
                      เริ่มต้นคะแนนใหม่
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {overlay === "help" && (
            <div className="overlay" role="dialog" aria-modal="true" aria-label="วิธีเล่น">
              <div className="sheet">
                <div className="sheet-head">
                  <h2>วิธีเล่น</h2>
                  <button type="button" className="text-btn" onClick={() => setOverlay(null)}>
                    ปิด
                  </button>
                </div>
                <ol className="help">
                  <li>แตะการ์ดแสงแดด น้ำ ดิน หรืออากาศ ฟังไบรอั่นเล่าให้ฟัง</li>
                  <li>แตะตัวไบรอั่นเพื่อฟังเสียงทักทาย</li>
                  <li>กดปุ่ม เริ่มเลย! แล้วแตะปัจจัยทั้ง 4 ให้ต้นไม้โตทีละขั้น</li>
                  <li>ตอบคำถามสั้น ๆ สะสมคะแนน แล้วไปดูสวนกับสมุดบันทึก</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Missions({
  onGrow,
  onFlowers,
  onView,
}: {
  onGrow: () => void;
  onFlowers: () => void;
  onView: (view: ViewId) => void;
}) {
  const items = [
    { title: "ปัจจัย 4 อย่าง", detail: "แตะแสง น้ำ ดิน และอากาศ ให้ต้นไม้โต", go: onGrow },
    { title: "เก็บดอกไม้ในทุ่ง", detail: "หาดอกไม้ 5 ดอกในทุ่งหญ้า", go: onFlowers },
    { title: "สมุดนักสำรวจ", detail: "อ่านสิ่งที่ค้นพบวันนี้", go: () => onView("notes") },
    { title: "สวนของไบรอั่น", detail: "ไปดูต้นไม้ที่ปลูกไว้", go: () => onView("garden") },
  ];
  return (
    <section className="page">
      <h2>ภารกิจนักสำรวจ</h2>
      <div className="cards">
        {items.map((item, index) => (
          <button key={item.title} type="button" className="mission" onClick={() => { playSfx("tap"); item.go(); }}>
            <span className="num">{index + 1}</span>
            <span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Garden({ count }: { count: number }) {
  return (
    <section className="page">
      <h2>สวนของฉัน</h2>
      <p className="lead">ปลูกแล้ว {count} ต้น จาก 6 กระถาง</p>
      <div className="pots">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={index < count ? "pot grown" : "pot"}>
            <span className="pot-plant" />
            <span className="pot-body" />
          </div>
        ))}
      </div>
    </section>
  );
}

function Notes({ learned }: { learned: FactorId[] }) {
  return (
    <section className="page">
      <h2>บันทึกนักสำรวจ</h2>
      <div className="notes">
        {FACTORS.map((factor) => {
          const open = learned.includes(factor.id);
          return (
            <article key={factor.id} className={open ? "note open" : "note"}>
              <h3>{factor.title}</h3>
              <p>{open ? factor.fact : "ยังไม่ได้สำรวจ — ไปแตะปัจจัยนี้ในเกมปลูกต้นไม้"}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Kit({ save }: { save: { learned: FactorId[]; garden: number; flowerClear: boolean; level: number; quizDone: boolean } }) {
  const badges = [
    { name: "นักสำรวจน้อย", earned: true, hint: "เปิดห้องเรียน" },
    { name: "เพื่อนแสงแดด", earned: save.learned.includes("sun"), hint: "สำรวจแสงแดด" },
    { name: "นักรดน้ำ", earned: save.learned.includes("water"), hint: "สำรวจน้ำ" },
    { name: "ชาวสวนดิน", earned: save.learned.includes("soil"), hint: "สำรวจดิน" },
    { name: "ลมหายใจพืช", earned: save.learned.includes("air"), hint: "สำรวจอากาศ" },
    { name: "ดอกไม้บาน", earned: save.garden > 0, hint: "ปลูกต้นไม้สำเร็จ" },
    { name: "นักเก็บดอกไม้", earned: save.flowerClear, hint: "เก็บดอกไม้ครบ" },
    { name: "ผ่านคำถาม", earned: save.quizDone, hint: "ตอบคำถามครบ" },
    { name: "ระดับสูงขึ้น", earned: save.level > 5, hint: "เลื่อนระดับ" },
  ];
  return (
    <section className="page">
      <h2>คลังแสง</h2>
      <div className="badges">
        {badges.map((badge) => (
          <article key={badge.name} className={badge.earned ? "badge-card on" : "badge-card"}>
            <StarIcon />
            <strong>{badge.name}</strong>
            <small>{badge.earned ? "ได้รับแล้ว" : badge.hint}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

