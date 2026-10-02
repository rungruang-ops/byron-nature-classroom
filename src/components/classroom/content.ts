export type FactorId = "sun" | "water" | "soil" | "air";

export type Factor = {
  id: FactorId;
  title: string;
  sub: string;
  line: string;
  fact: string;
};

export const CHARACTER = "ไบรอั่น";

export const DEFAULT_LINE = "ไบรอั่นพร้อมแล้วนะ, วันนี้เราจะสำรวจอะไรกันดี";
export const INTRO_LINE = "สวัสดีจ้า, ฉันชื่อไบรอั่น";

export const LINES = {
  go: "ไปปลูกต้นไม้ด้วยกันเลย",
  bloom: "ดอกไม้บานแล้ว, เก่งมากเลย",
  wrong: "ยังไม่ใช่นะ, ลองคิดอีกที",
  quiz: "ตอบถูกหมดเลย, นักสำรวจตัวจริง",
  flowers: "เก็บดอกไม้ครบห้าดอกแล้ว",
  again: "เก็บซ้ำได้แล้วนะ, ดอกไม้ยังบานสวย",
} as const;

export function poseFor(text: string) {
  if (text === INTRO_LINE || text === LINES.go) return "hop";
  if (text.includes("แสงแดด")) return "sun";
  if (text.includes("น้ำช่วย")) return "water";
  if (text.includes("ดินคือ")) return "soil";
  if (text.includes("อากาศ")) return "air";
  if (text === LINES.wrong) return "shy";
  if (text === LINES.bloom || text === LINES.quiz || text === LINES.flowers || text === LINES.again) return "cheer";
  return "talk";
}

export const SPOKEN: Record<string, string> = {
  [DEFAULT_LINE]: "/voice/hello.mp3?v=boy",
  [INTRO_LINE]: "/voice/intro.mp3?v=boy",
  "แสงแดดให้พลังงานกับใบสีเขียวนะ": "/voice/sun.mp3?v=boy",
  "น้ำช่วยให้ดินชุ่ม, รากได้ดื่มอิ่มเลย", "/voice/water.mp3?v=boy",
  "ดินคือบ้านของรากนะ, ยึดต้นไว้ให้แน่น", "/voice/soil.mp3?v=boy",
  "อากาศช่วยให้พืชแลกเปลี่ยนก๊าซได้", "/voice/air.mp3?v=boy",
  [LINES.go]: "/voice/go.mp3?v=boy",
  [LINES.bloom]: "/voice/bloom.mp3?v=boy",
  [LINES.wrong]: "/voice/wrong.mp3?v=boy",
  [LINES.quiz]: "/voice/quiz.mp3?v=boy",
  [LINES.flowers]: "/voice/flowers.mp3?v=boy",
  [LINES.again]: "/voice/again.mp3?v=boy",
};


export const FACTORS: Factor[] = [
  {
    id: "sun",
    title: "แสงแดด",
    sub: "ให้พลังงาน",
    line: "แสงแดดให้พลังงานกับใบสีเขียวนะ",
    fact: "พืชใช้แสงแดดเป็นพลังงาน ใบสีเขียวเปลี่ยนแสง น้ำ และอากาศ ให้กลายเป็นอาหาร เรียกว่าการสังเคราะห์ด้วยแสง",
  },
  {
    id: "water",
    title: "น้ำ",
    sub: "เพื่อให้ชุ่มชื้น",
    line: "น้ำช่วยให้ดินชุ่ม, รากได้ดื่มอิ่มเลย",
    fact: "น้ำทำให้ดินชุ่มชื้น รากจึงดูดน้ำและแร่ธาตุขึ้นไปเลี้ยงลำต้นกับใบได้",
  },
  {
    id: "soil",
    title: "ดิน",
    sub: "รากยึดต้น",
    line: "ดินคือบ้านของรากนะ, ยึดต้นไว้ให้แน่น",
    fact: "ดินเป็นที่ยึดของราก ทำให้ต้นไม่ล้ม และเก็บน้ำกับอาหารไว้ให้พืชใช้",
  },
  {
    id: "air",
    title: "อากาศ",
    sub: "แลกเปลี่ยนก๊าซ",
    line: "อากาศช่วยให้พืชแลกเปลี่ยนก๊าซได้",
    fact: "พืชรับคาร์บอนไดออกไซด์จากอากาศทางใบ แล้วปล่อยออกซิเจนที่เราใช้หายใจ",
  },
];

export const FACTOR_MAP: Record<FactorId, Factor> = {
  sun: FACTORS[0],
  water: FACTORS[1],
  soil: FACTORS[2],
  air: FACTORS[3],
};

export const QUIZ: { q: string; choices: string[]; ok: number }[] = [
  {
    q: "พืชใช้แสงแดดทำอะไร?",
    choices: ["ให้พลังงาน", "ทำให้ต้นหลับ", "ทำให้ใบเป็นน้ำแข็ง"],
    ok: 0,
  },
  {
    q: "รากของพืชอาศัยอยู่ที่ไหน?",
    choices: ["บนก้อนเมฆ", "ในดิน", "ในสายรุ้ง"],
    ok: 1,
  },
  {
    q: "พืชแลกเปลี่ยนก๊าซกับอะไร?",
    choices: ["ก้อนหิน", "แสงจันทร์", "อากาศ"],
    ok: 2,
  },
];

export type ViewId = "home" | "missions" | "garden" | "notes" | "kit";

export const NAV: { id: ViewId; label: string }[] = [
  { id: "home", label: "หน้าหลัก" },
  { id: "missions", label: "ภารกิจ" },
  { id: "garden", label: "สวนของฉัน" },
  { id: "notes", label: "บันทึก" },
  { id: "kit", label: "คลังแสง" },
];
