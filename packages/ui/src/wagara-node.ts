/**
 * Wagara Pattern Generator - Node.js build-time utilities
 * 
 * File system operations for generating pattern SVG files.
 * DO NOT import this in React Native code.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { generateAllPatterns, Pattern } from "./wagara";

export function saveAllPatterns(outputDir: string): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const patterns = generateAllPatterns();

  for (const pattern of patterns) {
    const filename = path.join(outputDir, `${pattern.name}.svg`);
    fs.writeFileSync(filename, pattern.svg);
    console.log(`Saved: ${filename}`);
  }

  // Generate index JSON
  const index = patterns.map(p => ({
    name: p.name,
    title: p.title,
    filename: `${p.name}.svg`
  }));
  fs.writeFileSync(path.join(outputDir, "index.json"), JSON.stringify(index, null, 2));
  console.log(`Saved: ${path.join(outputDir, "index.json")}`);
}

// CLI usage: npx ts-node packages/ui/src/wagara-node.ts
if (require.main === module) {
  const outputDir = process.argv[2] || "./output/wagara";
  saveAllPatterns(outputDir);
  console.log(`Wagara patterns generated in ${outputDir}`);
}