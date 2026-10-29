// node:fetch available in Node 18+
import * as fs from "node:fs";
import * as path from "node:path";

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

// JLPT levels to fetch
const JLPT_LEVELS = [5, 4, 3] as const; // MVP: N5-N3 (612 kanji)

async function fetchFromKanjiAPI(): Promise<KanjiSource[]> {
  const kanji: Map<string, KanjiSource> = new Map();

  for (const level of JLPT_LEVELS) {
    console.log(`Fetching JLPT N${6 - level} (level ${level})...`);

    try {
      const url = `https://kanjiapi.dev/v1/kanji/jlpt-${level}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`kanjiapi.dev returned ${res.status}`);
      }

      const data = await res.json() as string[];

      for (const character of data) {
        if (kanji.has(character)) continue;

        try {
          // Fetch individual kanji details
          const detailUrl = `https://kanjiapi.dev/v1/kanji/${character}`;
          const detailRes = await fetch(detailUrl);

          if (!detailRes.ok) {
            console.warn(`  ⚠ Skip ${character}: API returned ${detailRes.status}`);
            continue;
          }

          const detail = (await detailRes.json()) as Record<string, unknown>;

          const entry: KanjiSource = {
            id: character.charCodeAt(0).toString(),
            character,
            unicode: `U+${character.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
            jlpt: level,
            strokes: (detail.stroke_count as number) || 0,
            grade: (detail.grade as number) || undefined,
            meaning: (detail.meaning as string) || "",
            meanings_en: Array.isArray(detail.meanings)
              ? (detail.meanings as string[])
              : [],
            meanings_id: [], // TODO: map from meanings_en
            readings_on: Array.isArray(detail.on_readings)
              ? (detail.on_readings as string[])
              : [],
            readings_kun: Array.isArray(detail.kun_readings)
              ? (detail.kun_readings as string[])
              : [],
            radical: (detail.radical as Record<string, unknown>)?.symbol as string | undefined,
            examples: []
          };

          kanji.set(character, entry);

          // Rate limit: 100ms between requests
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          console.warn(`  ⚠ Error fetching ${character}:`, (err as Error).message);
        }
      }
    } catch (err) {
      console.error(`❌ Failed to fetch JLPT ${level}:`, (err as Error).message);
      throw err;
    }
  }

  return Array.from(kanji.values());
}

async function mapIndonesianMeanings(
  entries: KanjiSource[]
): Promise<KanjiSource[]> {
  // Simple mapping: use fallback translations
  // In production, this would use a proper translation service or manual mapping
  const meaning_map: Record<string, string> = {
    "one": "satu",
    "two": "dua",
    "three": "tiga",
    "person": "orang",
    "man": "laki-laki",
    "woman": "perempuan",
    "tree": "pohon",
    "fire": "api",
    "water": "air",
    "mountain": "gunung",
    "sun": "matahari",
    "moon": "bulan",
    "day": "hari",
    "time": "waktu",
    "hand": "tangan",
    "eye": "mata",
    "heart": "hati",
    "book": "buku",
    "word": "kata",
    "language": "bahasa",
    "country": "negara",
    "city": "kota",
    "street": "jalan",
    "house": "rumah",
    "door": "pintu",
    "window": "jendela",
    "food": "makanan",
    "eat": "makan",
    "drink": "minum",
    "money": "uang",
    "work": "kerja",
    "rest": "istirahat",
    "large": "besar",
    "small": "kecil",
    "good": "bagus",
    "bad": "buruk",
    "fast": "cepat",
    "slow": "lambat",
    "hot": "panas",
    "cold": "dingin"
  };

  return entries.map(entry => {
    const meanings_id = entry.meanings_en.map(en => meaning_map[en.toLowerCase()] || en);
    return { ...entry, meanings_id };
  });
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("🚀 Starting Kanji data fetch...\n");

  try {
    const kanji = await fetchFromKanjiAPI();
    console.log(`\n✅ Fetched ${kanji.length} kanji from kanjiapi.dev`);

    const withMeanings = await mapIndonesianMeanings(kanji);
    console.log(`✅ Mapped Indonesian meanings`);

    fs.writeFileSync(KANJI_FILE, JSON.stringify(withMeanings, null, 2));
    console.log(`✅ Saved to ${KANJI_FILE}`);

    console.log(`\nSummary:
- JLPT N5 (Level 5): ${withMeanings.filter(k => k.jlpt === 5).length} kanji
- JLPT N4 (Level 4): ${withMeanings.filter(k => k.jlpt === 4).length} kanji
- JLPT N3 (Level 3): ${withMeanings.filter(k => k.jlpt === 3).length} kanji
- Total: ${withMeanings.length} kanji`);
  } catch (err) {
    console.error("❌ Pipeline failed:", (err as Error).message);
    process.exit(1);
  }
}

main();