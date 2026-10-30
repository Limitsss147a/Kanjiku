/**
 * Wagara Pattern Generator
 * 
 * 7 traditional Japanese geometric patterns (64x64 SVG)
 * Used as widget background and app UI decorations
 * 
 * CC0 (Public Domain) - generated procedurally
 */

import * as fs from "node:fs";
import * as path from "node:path";

type PatternName =
  | "seigaiha"
  | "asanoha"
  | "shippo"
  | "kikko"
  | "ichimatsu"
  | "yagasuri"
  | "sayagata";

export interface Pattern {
  name: PatternName;
  title: string;
  viewBox: string;
  svg: string;
}

function generateSeigaiha(): string {
  // Blue wave pattern: concentric circles
  let svg = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">';
  const colors = ["#e8f4f8", "#b3dce6", "#7ecdd1"];
  for (let y = 0; y < 64; y += 16) {
    for (let x = 0; x < 64; x += 16) {
      for (let i = 0; i < 3; i++) {
        svg += `<circle cx="${x + 8}" cy="${y + 8}" r="${8 - i * 3}" fill="none" stroke="${colors[i]}" stroke-width="1.5"/>`;
      }
    }
  }
  svg += "</svg>";
  return svg;
}

function generateAsanoha(): string {
  // Hemp leaf pattern: hexagons with line detail
  let svg = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">';
  const hexW = 16;
  const hexH = 14;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const x = col * hexW + (row % 2) * (hexW / 2);
      const y = row * hexH;
      // Simplified hexagon as circle with lines
      svg += `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="#8b7355" stroke-width="1"/>`;
      svg += `<line x1="${x - 4}" y1="${y}" x2="${x + 4}" y2="${y}" stroke="#8b7355" stroke-width="0.5"/>`;
    }
  }
  svg += "</svg>";
  return svg;
}

function generateShippo(): string {
  // Quatrefoil cloisonné pattern: overlapping circles
  let svg = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">';
  const size = 16;
  for (let y = 0; y < 64; y += size) {
    for (let x = 0; x < 64; x += size) {
      const cx = x + size / 2;
      const cy = y + size / 2;
      // Draw 4 overlapping circles at corners to create quatrefoil
      svg += `<circle cx="${cx - 4}" cy="${cy - 4}" r="5" fill="none" stroke="#c9a876" stroke-width="1"/>`;
      svg += `<circle cx="${cx + 4}" cy="${cy - 4}" r="5" fill="none" stroke="#c9a876" stroke-width="1"/>`;
      svg += `<circle cx="${cx - 4}" cy="${cy + 4}" r="5" fill="none" stroke="#c9a876" stroke-width="1"/>`;
      svg += `<circle cx="${cx + 4}" cy="${cy + 4}" r="5" fill="none" stroke="#c9a876" stroke-width="1"/>`;
    }
  }
  svg += "</svg>";
  return svg;
}

function generateKikko(): string {
  // Tortoise shell pattern: hexagonal grid
  let svg = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">';
  const size = 12;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const x = col * size + (row % 2) * (size / 2);
      const y = row * (size * 0.866);
      const r = size / 2;
      // Hexagon as polygon
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * 60 * Math.PI) / 180;
        points.push([x + r * Math.cos(angle), y + r * Math.sin(angle)]);
      }
      svg += `<polygon points="${points.map(p => p.join(`,`)).join(" ")}" fill="none" stroke="#d4a574" stroke-width="1"/>`;
    }
  }
  svg += "</svg>";
  return svg;
}

function generateIchimatsu(): string {
  // Checkerboard pattern: alternating squares
  let svg = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">';
  const size = 8;
  const colors = ["#faf6f1", "#e8dcc8"];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const colorIdx = (row + col) % 2;
      svg += `<rect x="${col * size}" y="${row * size}" width="${size}" height="${size}" fill="${colors[colorIdx]}"/>`;
    }
  }
  svg += "</svg>";
  return svg;
}

function generateYagasuri(): string {
  // Arrow feathers pattern: zigzag
  let svg = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">';
  const step = 8;
  for (let y = 0; y < 64; y += step) {
    for (let x = 0; x < 64; x += step) {
      svg += `<path d="M ${x} ${y} L ${x + 4} ${y + 4} L ${x} ${y + 8}" fill="none" stroke="#6b5344" stroke-width="1"/>`;
      svg += `<path d="M ${x + 4} ${y} L ${x + 8} ${y + 4} L ${x + 4} ${y + 8}" fill="none" stroke="#6b5344" stroke-width="1"/>`;
    }
  }
  svg += "</svg>";
  return svg;
}

function generateSayagata(): string {
  // Key fret pattern: geometric maze
  let svg = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">';
  const step = 8;
  for (let y = 0; y < 64; y += step) {
    for (let x = 0; x < 64; x += step) {
      svg += `<rect x="${x + 2}" y="${y + 2}" width="${4}" height="${4}" fill="#8b7d6b" stroke="none"/>`;
      svg += `<path d="M ${x + 2} ${y + 2} L ${x + 6} ${y + 2} L ${x + 6} ${y + 6} L ${x + 2} ${y + 6} Z" fill="none" stroke="#a89e8f" stroke-width="1"/>`;
    }
  }
  svg += "</svg>";
  return svg;
}

const patterns: Pattern[] = [
  {
    name: "seigaiha",
    title: "Seigaiha (Blue Wave)",
    viewBox: "0 0 64 64",
    svg: generateSeigaiha()
  },
  {
    name: "asanoha",
    title: "Asanoha (Hemp Leaf)",
    viewBox: "0 0 64 64",
    svg: generateAsanoha()
  },
  {
    name: "shippo",
    title: "Shippo (Cloisonné)",
    viewBox: "0 0 64 64",
    svg: generateShippo()
  },
  {
    name: "kikko",
    title: "Kikko (Tortoise Shell)",
    viewBox: "0 0 64 64",
    svg: generateKikko()
  },
  {
    name: "ichimatsu",
    title: "Ichimatsu (Checkerboard)",
    viewBox: "0 0 64 64",
    svg: generateIchimatsu()
  },
  {
    name: "yagasuri",
    title: "Yagasuri (Arrow Feathers)",
    viewBox: "0 0 64 64",
    svg: generateYagasuri()
  },
  {
    name: "sayagata",
    title: "Sayagata (Key Fret)",
    viewBox: "0 0 64 64",
    svg: generateSayagata()
  }
];

export function generateAllPatterns(): Pattern[] {
  return patterns;
}

export function generatePattern(name: PatternName): string {
  const pattern = patterns.find(p => p.name === name);
  if (!pattern) throw new Error(`Unknown pattern: ${name}`);
  return pattern.svg;
}

export function saveAllPatterns(outputDir: string): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

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