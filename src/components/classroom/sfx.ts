import { SPOKEN } from "./content";

type Kind = "tap" | "nav" | "grow" | "win" | "no";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxOn = true;
let musicWanted = false;
let musicTimer: ReturnType<typeof setTimeout> | null = null;
let installed = false;
let thaiVoice: SpeechSynthesisVoice | null = null;
let voiceHooked = false;
let voiceNode: AudioBufferSourceNode | null = null;
const rawClips = new Map<string, ArrayBuffer>();
const decoded = new Map<string, AudioBuffer>();
let talkId = 0;
let lastSpoken = "";
let lastSpokenAt = 0;
const clips = new Map<string, HTMLAudioElement>();
let currentClip: HTMLAudioElement | null = null;

const TUNE = [523.25, 659.25, 783.99, 880, 783.99, 659.25, 587.33, 523.25];

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    try {
      ctx = new AC({ latencyHint: "interactive" });
    } catch {
      ctx = new AC();
    }
    master = ctx.createGain();
    sfxBus = ctx.createGain();
    musicBus = ctx.createGain();
    master.gain.value = 1;
    sfxBus.gain.value = 1;
    musicBus.gain.value = 0.55;
    sfxBus.connect(master);
    musicBus.connect(master);
    master.connect(ctx.destination);
  }
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
  if (session) session.type = "playback";
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  context();
}

function tone(
  freq: number,
  at: number,
  dur: number,
  type: OscillatorType,
  bus: "sfx" | "music",
  gain: number,
) {
  const audio = ctx;
  const dest = bus === "sfx" ? sfxBus : musicBus;
  if (!audio || !dest) return;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  osc.connect(amp);
  amp.connect(dest);
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), at + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.start(at);
  osc.stop(at + dur + 0.03);
  osc.onended = () => {
    osc.disconnect();
    amp.disconnect();
  };
}

function loopMusic() {
  if (!musicWanted || !ctx) return;
  const start = ctx.currentTime + 0.06;
  TUNE.forEach((freq, i) => {
    tone(freq, start + i * 0.34, 0.3, "triangle", "music", 0.045);
    if (i % 2 === 0) tone(freq / 2, start + i * 0.34, 0.3, "sine", "music", 0.03);
  });
  musicTimer = setTimeout(loopMusic, TUNE.length * 340);
}

export function setSfxEnabled(on: boolean) {
  sfxOn = on;
}

export function setMusicEnabled(on: boolean) {
  musicWanted = on;
  if (!on) {
    if (musicTimer) clearTimeout(musicTimer);
    musicTimer = null;
    return;
  }
  unlockAudio();
  if (!musicTimer) loopMusic();
}

export function playSfx(kind: Kind) {
  if (!sfxOn) return;
  const audio = context();
  if (!audio) return;
  const t = audio.currentTime;
  const wobble = 0.97 + Math.random() * 0.06;
  if (kind === "tap") {
    tone(620 * wobble, t, 0.09, "sine", "sfx", 0.42);
    tone(880 * wobble, t + 0.05, 0.12, "triangle", "sfx", 0.28);
  } else if (kind === "nav") {
    tone(520 * wobble, t, 0.07, "sine", "sfx", 0.12);
  } else if (kind === "grow") {
    tone(392, t, 0.12, "triangle", "sfx", 0.14);
    tone(523, t + 0.08, 0.14, "triangle", "sfx", 0.14);
    tone(659, t + 0.16, 0.18, "sine", "sfx", 0.12);
  } else if (kind === "win") {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * 0.09, 0.22, "triangle", "sfx", 0.14));
  } else {
    tone(196, t, 0.14, "sine", "sfx", 0.1);
    tone(164, t + 0.08, 0.16, "triangle", "sfx", 0.08);
  }
}

function pickThaiVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  const thai = voices.filter((voice) => voice.lang.toLowerCase().replace("_", "-").startsWith("th"));
  thaiVoice =
    thai.find((voice) => /enhanced|premium|natural|kanya|narisa/i.test(voice.name)) ??
    thai.find((voice) => voice.localService) ??
    thai[0] ??
    null;
}

function ensureVoices() {
  if (voiceHooked || typeof window === "undefined" || !window.speechSynthesis) return;
  voiceHooked = true;
  pickThaiVoice();
  window.speechSynthesis.addEventListener("voiceschanged", pickThaiVoice);
}

function stopTalking() {
  if (voiceNode) {
    try {
      voiceNode.stop();
    } catch {
      /* already finished */
    }
    voiceNode = null;
  }
  if (currentClip) {
    currentClip.pause();
  }
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
}

function clipElement(src: string) {
  let el = clips.get(src);
  if (!el) {
    el = new Audio(src);
    el.preload = "auto";
    el.setAttribute("playsinline", "true");
    el.setAttribute("webkit-playsinline", "");
    el.volume = 1;
    el.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;opacity:0;pointer-events:none";
    clips.set(src, el);
    if (typeof document !== "undefined" && document.body) document.body.appendChild(el);
  }
  return el;
}

function playBuffer(buf: AudioBuffer) {
  const audio = ctx;
  if (!audio || !master) return;
  if (voiceNode) {
    try {
      voiceNode.stop();
    } catch {
      /* already finished */
    }
  }
  const node = audio.createBufferSource();
  node.buffer = buf;
  node.connect(master);
  voiceNode = node;
  node.onended = () => {
    if (voiceNode === node) voiceNode = null;
  };
  node.start();
}

async function decodeClip(src: string, audio: AudioContext) {
  const cached = decoded.get(src);
  if (cached) return cached;
  let raw = rawClips.get(src);
  if (!raw) {
    const res = await fetch(src);
    if (!res.ok) throw new Error("voice missing");
    raw = await res.arrayBuffer();
    rawClips.set(src, raw);
  }
  const buf = await audio.decodeAudioData(raw.slice(0));
  decoded.set(src, buf);
  return buf;
}

function browserSpeak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  ensureVoices();
  const utter = new SpeechSynthesisUtterance(text.replace(/!+/g, ""));
  utter.lang = "th-TH";
  utter.rate = 1.02;
  utter.pitch = 1.45;
  if (thaiVoice) utter.voice = thaiVoice;
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(utter);
}

export function speak(text: string, enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  const now = performance.now();
  if (text === lastSpoken && now - lastSpokenAt < 450) return;
  lastSpoken = text;
  lastSpokenAt = now;
  const id = ++talkId;
  const src = SPOKEN[text];
  const audio = context();
  if (currentClip) currentClip.pause();
  if (!src) {
    stopTalking();
    browserSpeak(text);
    return;
  }
  const ready = audio ? decoded.get(src) : undefined;
  if (ready && audio && audio.state === "running") {
    playBuffer(ready);
    return;
  }
  const el = clipElement(src);
  currentClip = el;
  el.muted = false;
  el.volume = 1;
  try {
    if (el.currentTime > 0) el.currentTime = 0;
  } catch {
    /* metadata not in yet */
  }
  const pending = el.play();
  void pending
    .then(() => {
      window.dispatchEvent(new CustomEvent("byron-audio-ok"));
    })
    .catch(() => {
      if (id !== talkId) return;
      const buf = decoded.get(src);
      if (buf && ctx) {
        void ctx.resume().then(() => {
          if (id === talkId) playBuffer(buf);
        });
        return;
      }
      browserSpeak(text);
      window.dispatchEvent(new CustomEvent("byron-audio-fail"));
    });
}

export function preloadVoice() {
  ensureVoices();
  if (typeof window === "undefined") return;
  for (const src of new Set(Object.values(SPOKEN))) {
    clipElement(src);
    if (rawClips.has(src)) continue;
    void fetch(src)
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject()))
      .then((raw) => {
        rawClips.set(src, raw);
        if (ctx) void decodeClip(src, ctx);
      })
      .catch(() => {});
  }
}

export function installAudioUnlock() {
  if (installed || typeof window === "undefined") return () => {};
  installed = true;
  preloadVoice();
  const wake = () => {
    unlockAudio();
    if (!ctx || ctx.state !== "running") return;
    for (const src of rawClips.keys()) {
      if (!decoded.has(src)) void decodeClip(src, ctx);
    }
  };
  window.addEventListener("pointerdown", wake, { capture: true });
  window.addEventListener("keydown", wake);
  const onVis = () => {
    if (document.visibilityState === "visible") unlockAudio();
  };
  document.addEventListener("visibilitychange", onVis);
  return () => {
    window.removeEventListener("pointerdown", wake, { capture: true });
    window.removeEventListener("keydown", wake);
    document.removeEventListener("visibilitychange", onVis);
    installed = false;
  };
}
