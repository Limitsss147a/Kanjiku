import * as fs from "node:fs";
import * as path from "node:path";

interface KanjiVGMapping {
  character: string;
  unicode: string;
  svg_filename: string;
  has_svg: boolean;
}

/**
 * KanjiVG: Stroke order SVG database (CC BY-SA 3.0)
 * Source: https://github.com/KanjiVG/kanjivg
 * 
 * Structure:
 * - kanjivg/kanji/{unicode}.svg (e.g., 4e00.svg for 一)
 * 
 * Strategy:
 * 1. Download kanjivg-{date}-main.zip from releases
 * 2. Extract kanji folder locally
 * 3. Map unicode → SVG filename
 * 4. Store paths in database + local manifest
 */

const OUTPUT_DIR = path.join(__dirname, "../../output");
const KANJIVG_DIR = path.join(OUTPUT_DIR, "kanjivg");
const MANIFEST_FILE = path.join(OUTPUT_DIR, "kanjivg-manifest.json");

function generateKanjiVGMapping(): KanjiVGMapping[] {
  const mapping: KanjiVGMapping[] = [];

  // Load kanji from kanji-raw.json
  const kanjiFile = path.join(OUTPUT_DIR, "kanji-raw.json");
  if (!fs.existsSync(kanjiFile)) {
    console.error("ERROR: kanji-raw.json not found. Run fetch:kanji first.");
    process.exit(1);
  }

  // @ts-ignore
  const kanji = JSON.parse(fs.readFileSync(kanjiFile, "utf-8"));

  console.log(`Checking KanjiVG SVG availability for ${kanji.length} kanji...\n`);

  for (const entry of kanji) {
    // Extract unicode: U+4E00 → 4e00.svg
    const unicodeParts = entry.unicode.split("+");
    if (unicodeParts.length !== 2) continue;

    const codePoint = unicodeParts[1].toLowerCase();
    const svgFilename = `${codePoint}.svg`;
    const svgPath = path.join(KANJIVG_DIR, "kanji", svgFilename);

    // Check if SVG exists locally
    const hasSvg = fs.existsSync(svgPath);

    mapping.push({
      character: entry.character,
      unicode: entry.unicode,
      svg_filename: svgFilename,
      has_svg: hasSvg
    });
  }

  return mapping;
}

function generateManifest(mapping: KanjiVGMapping[]): void {
  const stats = {
    total_kanji: mapping.length,
    with_svg: mapping.filter(m => m.has_svg).length,
    missing_svg: mapping.filter(m => !m.has_svg).length,
    coverage_percent: ((mapping.filter(m => m.has_svg).length / mapping.length) * 100).toFixed(1),
    mapping
  };

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(stats, null, 2));
  console.log(`\nKanjiVG Manifest: ${MANIFEST_FILE}`);
  console.log(`Total kanji: ${stats.total_kanji}`);
  console.log(`With SVG: ${stats.with_svg}`);
  console.log(`Missing SVG: ${stats.missing_svg}`);
  console.log(`Coverage: ${stats.coverage_percent}%`);
}

function main(): void {
  console.log("Generating KanjiVG SVG mapping...\n");

  try {
    if (!fs.existsSync(KANJIVG_DIR)) {
      console.log(`⚠️  KanjiVG directory not found: ${KANJIVG_DIR}`);
      console.log("Download KanjiVG from: https://github.com/KanjiVG/kanjivg/releases");
      console.log("Extract to: packages/data-pipeline/output/kanjivg/");
      console.log("\nGenerating empty manifest...");
      fs.writeFileSync(MANIFEST_FILE, JSON.stringify({
        total_kanji: 0,
        with_svg: 0,
        missing_svg: 0,
        coverage_percent: 0,
        mapping: [],
        note: "KanjiVG directory not found. Run setup after downloading."
      }, null, 2));
      return;
    }

    const mapping = generateKanjiVGMapping();
    generateManifest(mapping);
  } catch (err) {
    console.error("ERROR:", (err as Error).message);
    process.exit(1);
  }
}

main();