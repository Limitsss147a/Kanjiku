import initSqlJs from "sql.js";
import * as path from "node:path";
import * as fs from "node:fs";

const OUTPUT_DIR = path.join(__dirname, "../output");
const DB_FILE = path.join(OUTPUT_DIR, "kanjiku.db");

async function verifyDatabase(): Promise<void> {
  if (!fs.existsSync(DB_FILE)) {
    throw new Error(`Database not found: ${DB_FILE}`);
  }

  const filebuffer = fs.readFileSync(DB_FILE);
  const SQL = await initSqlJs();
  const db = new SQL.Database(filebuffer);

  try {
    console.log("Verifying database integrity...\n");

    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    console.log(`Tables (${tables[0]?.values.length || 0}):`);
    if (tables[0]?.values) {
      for (const row of tables[0].values) {
        console.log(`   - ${row[0]}`);
      }
    }

    const kanjiCount = db.exec("SELECT COUNT(*) as count FROM kanji");
    console.log(`\nKanji entries: ${kanjiCount[0]?.values[0][0]}`);

    const jlptStats = db.exec(
      `SELECT jlpt, COUNT(*) as count FROM kanji GROUP BY jlpt ORDER BY jlpt DESC`
    );
    console.log("   By JLPT level:");
    let total = 0;
    if (jlptStats[0]?.values) {
      for (const row of jlptStats[0].values) {
        const level = row[0] as number; // jlpt: 5 = N5, 4 = N4, 3 = N3
        const count = row[1] as number;
        console.log(`     N${level}: ${count}`);
        total += count;
      }
    }
    console.log(`     Total MVP (N5-N3): ${total}`);

    console.log("\nSample kanji entries:");
    const samples = db.exec(
      "SELECT character, unicode, meanings_id, jlpt FROM kanji LIMIT 3"
    );
    if (samples[0]?.values) {
      for (const row of samples[0].values) {
        const char = row[0];
        const unicode = row[1];
        const meanings = JSON.parse(row[2] as string);
        const jlpt = row[3] as number;
        console.log(`   ${char} (${unicode}) [N${jlpt}] -> ${meanings.join(", ")}`);
        }
    }

    const integrity = db.exec("PRAGMA integrity_check");
    if (integrity[0]?.values[0][0] === "ok") {
      console.log("\nDatabase integrity: OK");
    } else {
      console.error("\nDatabase integrity check failed:", integrity[0]?.values[0][0]);
      process.exit(1);
    }

    console.log("\nVerification complete");
  } finally {
    db.close();
  }
}

verifyDatabase();
