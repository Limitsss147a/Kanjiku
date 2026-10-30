/**
 * Font Subsetting for Kanjiku
 * 
 * Reduces font size from ~10MB → ~300KB by including only:
 * - 612 kanji (N5-N3)
 * - Basic Latin + common symbols for UI
 * 
 * Source: Noto Serif JP (Google Fonts, OFL License)
 * Tool: pyftsubset (fonttools)
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as https from "node:https";
import { execSync } from "node:child_process";

const OUTPUT_DIR = path.join(__dirname, "../output");
const FONTS_DIR = path.join(OUTPUT_DIR, "fonts");
const KANJI_RAW_FILE = path.join(OUTPUT_DIR, "kanji-raw.json");

interface KanjiData {
  character: string;
  unicode: string;
}

function loadKanjiData(): KanjiData[] {
  if (!fs.existsSync(KANJI_RAW_FILE)) {
    throw new Error(`kanji-raw.json not found. Run fetch:kanji first.`);
  }
  return JSON.parse(fs.readFileSync(KANJI_RAW_FILE, "utf-8"));
}

/**
 * Generate Unicode range for subsetting
 * Format: "U+XXXX,U+YYYY" for pyftsubset
 */
function generateUnicodeRange(kanjiData: KanjiData[]): string {
  const ranges = [];

  // Basic ASCII (32-126)
  ranges.push("U+0020-007E");

  // Common punctuation & symbols
  ranges.push("U+3001-303F"); // CJK Symbols and Punctuation

  // Hiragana & Katakana
  ranges.push("U+3040-309F"); // Hiragana
  ranges.push("U+30A0-30FF"); // Katakana

  // Kanji characters from our data
  for (const item of kanjiData) {
    if (item.unicode.startsWith("U+")) {
      ranges.push(item.unicode);
    }
  }

  return ranges.join(",");
}

/**
 * Download Noto Serif JP from Google Fonts CDN
 */
async function downloadFont(): Promise<string> {
  if (!fs.existsSync(FONTS_DIR)) {
    fs.mkdirSync(FONTS_DIR, { recursive: true });
  }

  // Use a pre-released/open version from Google Fonts
  const fontUrl =
    "https://github.com/google/noto-cjk/raw/main/Sans/Variable/NotoSansCJK-VF.ttf";

  const fontPath = path.join(FONTS_DIR, "NotoSansCJK-Original.ttf");

  if (fs.existsSync(fontPath)) {
    console.log("Font already downloaded:", fontPath);
    return fontPath;
  }

  console.log("Downloading font from Google Fonts...");
  console.log("Note: Using Noto Sans CJK as fallback (smaller than Serif)");

  return new Promise((resolve, reject) => {
    https.get(fontUrl, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        return downloadFont().then(resolve).catch(reject);
      }

      const file = fs.createWriteStream(fontPath);
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        console.log("Downloaded:", fontPath);
        resolve(fontPath);
      });
      file.on("error", reject);
    }).on("error", reject);
  });
}

/**
 * Subset font using pyftsubset
 */
function subsetFont(
  originalPath: string,
  unicodeRange: string,
  outputPath: string
): void {
  console.log("\nSubsetting font...");
  console.log(`Ranges: ${unicodeRange.split(",").length} unicode blocks`);

  try {
    execSync(
      `pyftsubset "${originalPath}" --unicodes="${unicodeRange}" --output-file="${outputPath}"`,
      { stdio: "inherit" }
    );
    console.log("✅ Subset complete:", outputPath);

    // Show size reduction
    const originalSize = fs.statSync(originalPath).size / 1024 / 1024;
    const subsetSize = fs.statSync(outputPath).size / 1024;
    console.log(
      `Size: ${originalSize.toFixed(2)}MB → ${subsetSize.toFixed(0)}KB (${((subsetSize / (originalSize * 1024)) * 100).toFixed(1)}%)`
    );
  } catch (error) {
    console.error("pyftsubset failed:", error);
    throw error;
  }
}

async function main() {
  try {
    console.log("Font Subsetting Pipeline\n");

    const kanjiData = loadKanjiData();
    console.log(`Loaded ${kanjiData.length} kanji\n`);

    const unicodeRange = generateUnicodeRange(kanjiData);

    // For MVP, use a pre-downloaded copy or skip if unavailable
    // In production CI, use GitHub Releases or Google Fonts API
    const fontPath = path.join(
      FONTS_DIR,
      "NotoSansCJK-Original.ttf"
    );

    if (!fs.existsSync(fontPath)) {
      console.log(
        "⚠️  Font not found. Download manually from:\n  https://github.com/google/noto-cjk/releases"
      );
      console.log("Extract to:", FONTS_DIR);
      console.log(
        "\nFor now, generating placeholder manifest for app to use system fonts.\n"
      );

      // Generate font manifest without actual subsetting
      const manifest = {
        fonts: [
          {
            name: "Noto Sans CJK",
            type: "system",
            subset: `${kanjiData.length} kanji + Latin`,
            location: "system_font",
          },
        ],
        note: "Actual subset font requires manual download due to size (~250MB)",
      };

      fs.writeFileSync(
        path.join(OUTPUT_DIR, "fonts-manifest.json"),
        JSON.stringify(manifest, null, 2)
      );

      console.log("Manifest saved:", path.join(OUTPUT_DIR, "fonts-manifest.json"));
      return;
    }

    const outputPath = path.join(FONTS_DIR, "KanjiKu-Subset.ttf");
    subsetFont(fontPath, unicodeRange, outputPath);

    // Generate manifest
    const manifest = {
      fonts: [
        {
          name: "Noto Sans CJK Subset",
          type: "embedded",
          subset_count: kanjiData.length,
          original_size_mb: (fs.statSync(fontPath).size / 1024 / 1024).toFixed(
            2
          ),
          subset_size_kb: (fs.statSync(outputPath).size / 1024).toFixed(0),
          filename: "KanjiKu-Subset.ttf",
          license: "OFL 1.1",
          source: "https://github.com/google/noto-cjk",
        },
      ],
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, "fonts-manifest.json"),
      JSON.stringify(manifest, null, 2)
    );

    console.log("\n✅ Manifest saved:", path.join(OUTPUT_DIR, "fonts-manifest.json"));
  } catch (error) {
    console.error("❌ Pipeline failed:", (error as Error).message);
    process.exit(1);
  }
}

main();