import * as fs from "node:fs";
import * as path from "node:path";

// @ts-ignore
import * as kanji from "kanji-data";

interface KanjiSource {
  id: string;
  character: string;
  unicode: string;
  jlpt: number;
  strokes: number;
  grade?: number;
  meaning: string;
  meanings_en: string[];
  meanings_id: string[];
  readings_on: string[];
  readings_kun: string[];
  radical?: string;
  examples: Array<{
    word: string;
    reading: string;
    meaning: string;
  }>;
}

const OUTPUT_DIR = path.join(__dirname, "../output");
const KANJI_FILE = path.join(OUTPUT_DIR, "kanji-raw.json");
const JLPT_LEVELS = [5, 4, 3] as const;

const meaningMap: Record<string, string> = {
  one: "satu", two: "dua", three: "tiga", four: "empat", five: "lima",
  six: "enam", seven: "tujuh", eight: "delapan", nine: "sembilan", ten: "sepuluh",
  person: "orang", man: "laki-laki", woman: "perempuan", child: "anak",
  tree: "pohon", fire: "api", water: "air", mountain: "gunung",
  sun: "matahari", moon: "bulan", day: "hari", time: "waktu",
  hand: "tangan", eye: "mata", heart: "hati", mouth: "mulut",
  book: "buku", word: "kata", language: "bahasa", country: "negara",
  city: "kota", street: "jalan", house: "rumah", door: "pintu",
  food: "makanan", eat: "makan", drink: "minum", money: "uang",
  work: "kerja", rest: "istirahat", large: "besar", small: "kecil",
  good: "bagus", bad: "buruk", fast: "cepat", slow: "lambat"
};

function fetchFromLocal(): KanjiSource[] {
  const entries: KanjiSource[] = [];

  for (const level of JLPT_LEVELS) {
    const list = kanji.getJlpt(level);
    console.log(`Processing JLPT N${6 - level} (level ${level}): ${list.length} kanji`);

    for (const char of list) {
      const detail = kanji.get(char);
      if (!detail) continue;

      const meanings_en = detail.meanings || [];
      const meanings_id = meanings_en.map((en: string) => 
        meaningMap[en.toLowerCase()] || en
      );

      entries.push({
        id: char.charCodeAt(0).toString(),
        character: char,
        unicode: `U+${detail.unicode || char.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
        jlpt: level,
        strokes: detail.stroke_count || 0,
        grade: detail.grade || undefined,
        meaning: detail.meanings?.[0] || "",
        meanings_en,
        meanings_id,
        readings_on: detail.on_readings || [],
        readings_kun: detail.kun_readings || [],
        radical: undefined,
        examples: []
      });
    }
  }

  return entries;
}

function main(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("Fetching kanji from local kanji-data package...\n");

  try {
    const data = fetchFromLocal();
    console.log(`\nFetched ${data.length} kanji`);

    fs.writeFileSync(KANJI_FILE, JSON.stringify(data, null, 2));
    console.log(`Saved to ${KANJI_FILE}`);

    console.log(`\nSummary:
- JLPT N5: ${data.filter(k => k.jlpt === 5).length}
- JLPT N4: ${data.filter(k => k.jlpt === 4).length}
- JLPT N3: ${data.filter(k => k.jlpt === 3).length}
- Total: ${data.length}`);
  } catch (err) {
    console.error("Fetch failed:", (err as Error).message);
    process.exit(1);
  }
}

main();
