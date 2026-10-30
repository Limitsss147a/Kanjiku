import initSqlJs, { Database } from "sql.js";
import * as fs from "node:fs";
import * as path from "node:path";

interface KanjiRaw {
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
const DB_FILE = path.join(OUTPUT_DIR, "kanjiku.db");

function initializeDatabase(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS kanji (
      id TEXT PRIMARY KEY,
      character TEXT NOT NULL UNIQUE,
      unicode TEXT NOT NULL,
      jlpt INTEGER NOT NULL,
      strokes INTEGER,
      grade INTEGER,
      meaning TEXT,
      meanings_en TEXT,
      meanings_id TEXT,
      readings_on TEXT,
      readings_kun TEXT,
      radical TEXT,
      svg_filename TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_kanji_jlpt ON kanji(jlpt)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_kanji_character ON kanji(character)`);

  db.run(`
    CREATE TABLE IF NOT EXISTS widget_queue (
      id TEXT PRIMARY KEY,
      widget_id TEXT NOT NULL,
      kanji_id TEXT NOT NULL,
      due_at INTEGER NOT NULL,
      displayed_count INTEGER DEFAULT 0,
      last_displayed_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_queue_widget ON widget_queue(widget_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_queue_due ON widget_queue(due_at)`);

  db.run(`
    CREATE TABLE IF NOT EXISTS srs_reviews (
      id TEXT PRIMARY KEY,
      kanji_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      interval INTEGER DEFAULT 1,
      ease REAL DEFAULT 2.5,
      repetitions INTEGER DEFAULT 0,
      lapses INTEGER DEFAULT 0,
      next_review_at INTEGER,
      difficulty REAL DEFAULT 0.5,
      last_reviewed_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_srs_user ON srs_reviews(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_srs_next_review ON srs_reviews(next_review_at)`);

  db.run(`
    CREATE TABLE IF NOT EXISTS widget_config (
      widget_id TEXT PRIMARY KEY,
      interval INTEGER DEFAULT 15,
      source TEXT DEFAULT 'jlpt-5',
      order_mode TEXT DEFAULT 'queue',
      theme TEXT DEFAULT 'washi-light',
      active_schedule_enabled INTEGER DEFAULT 0,
      active_schedule_start INTEGER DEFAULT 7,
      active_schedule_end INTEGER DEFAULT 22,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS widget_display_log (
      id TEXT PRIMARY KEY,
      widget_id TEXT NOT NULL,
      kanji_id TEXT NOT NULL,
      displayed_at INTEGER NOT NULL,
      duration_ms INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_display_log_widget ON widget_display_log(widget_id)`);
}

function loadKanjiData(): KanjiRaw[] {
  if (!fs.existsSync(KANJI_FILE)) {
    throw new Error(`Kanji data file not found: ${KANJI_FILE}`);
  }
  const content = fs.readFileSync(KANJI_FILE, "utf-8");
  return JSON.parse(content);
}

function insertKanjiData(db: Database, kanji: KanjiRaw[]): void {
  for (const item of kanji) {
    // Generate KanjiVG SVG filename from unicode
    const unicodeParts = item.unicode.split("+");
    const svgFilename = unicodeParts.length === 2 
      ? `${unicodeParts[1].toLowerCase()}.svg`
      : null;

    db.run(
      `INSERT OR REPLACE INTO kanji (
        id, character, unicode, jlpt, strokes, grade,
        meaning, meanings_en, meanings_id,
        readings_on, readings_kun, radical, svg_filename
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id, item.character, item.unicode, item.jlpt,
        item.strokes, item.grade ?? null, item.meaning,
        JSON.stringify(item.meanings_en),
        JSON.stringify(item.meanings_id),
        JSON.stringify(item.readings_on),
        JSON.stringify(item.readings_kun),
        item.radical ?? null,
        svgFilename
      ]
    );
  }
}

async function main(): Promise<void> {
  console.log("Building SQLite database...\n");
  try {
    const kanji = loadKanjiData();
    console.log(`Loaded ${kanji.length} kanji entries`);

    const SQL = await initSqlJs();
    const db = new SQL.Database();
    console.log(`Initialized in-memory database`);

    initializeDatabase(db);
    console.log("Schema initialized");

    insertKanjiData(db, kanji);
    console.log(`Inserted ${kanji.length} kanji entries`);

    const stats = db.exec(
      "SELECT jlpt, COUNT(*) as count FROM kanji GROUP BY jlpt ORDER BY jlpt DESC"
    );
    console.log("\nKanji per JLPT level:");
    if (stats.length > 0 && stats[0].values) {
      for (const row of stats[0].values) {
        console.log(`  N${6 - (row[0] as number)}: ${row[1]}`);
      }
    }

    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
    console.log(`\nDatabase build complete: ${DB_FILE}`);
    console.log(`Size: ${(buffer.length / 1024).toFixed(2)} KB`);
  } catch (err) {
    console.error("Build failed:", (err as Error).message);
    process.exit(1);
  }
}

main();
