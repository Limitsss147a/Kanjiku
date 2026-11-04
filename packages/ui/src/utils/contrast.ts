import { colors } from '../tokens';

// WCAG contrast ratio calculator
function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const toRgb = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    return [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255] as [number, number, number];
  };

  const [r1, g1, b1] = toRgb(hex1);
  const [r2, g2, b2] = toRgb(hex2);

  const l1 = luminance(r1, g1, b1);
  const l2 = luminance(r2, g2, b2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

interface ContrastCheck {
  pair: [string, string];
  ratio: number;
  normalTextPass: boolean; // 4.5:1
  largeTextPass: boolean;  // 3:1
}

export function checkThemeContrast(): ContrastCheck[] {
  const washi = colors.washi;
  const sumi = colors.sumi;

  const checks: ContrastCheck[] = [];

  // Washi (light) theme checks
  checks.push({
    pair: ['Washi text on surface', 'text/surface'],
    ratio: contrastRatio(washi.text, washi.surface),
    normalTextPass: contrastRatio(washi.text, washi.surface) >= 4.5,
    largeTextPass: contrastRatio(washi.text, washi.surface) >= 3,
  });

  checks.push({
    pair: ['Washi accent on surface', 'accent/surface'],
    ratio: contrastRatio(washi.accent, washi.surface),
    normalTextPass: contrastRatio(washi.accent, washi.surface) >= 4.5,
    largeTextPass: contrastRatio(washi.accent, washi.surface) >= 3,
  });

  checks.push({
    pair: ['Washi textSecondary on surface', 'textSecondary/surface'],
    ratio: contrastRatio(washi.textSecondary, washi.surface),
    normalTextPass: contrastRatio(washi.textSecondary, washi.surface) >= 4.5,
    largeTextPass: contrastRatio(washi.textSecondary, washi.surface) >= 3,
  });

  // Sumi (dark) theme checks
  checks.push({
    pair: ['Sumi text on surface', 'text/surface (dark)'],
    ratio: contrastRatio(sumi.text, sumi.surface),
    normalTextPass: contrastRatio(sumi.text, sumi.surface) >= 4.5,
    largeTextPass: contrastRatio(sumi.text, sumi.surface) >= 3,
  });

  checks.push({
    pair: ['Sumi accent on surface', 'accent/surface (dark)'],
    ratio: contrastRatio(sumi.accent, sumi.surface),
    normalTextPass: contrastRatio(sumi.accent, sumi.surface) >= 4.5,
    largeTextPass: contrastRatio(sumi.accent, sumi.surface) >= 3,
  });

  checks.push({
    pair: ['Sumi textSecondary on surface', 'textSecondary/surface (dark)'],
    ratio: contrastRatio(sumi.textSecondary, sumi.surface),
    normalTextPass: contrastRatio(sumi.textSecondary, sumi.surface) >= 4.5,
    largeTextPass: contrastRatio(sumi.textSecondary, sumi.surface) >= 3,
  });

  return checks;
}

export function reportContrast(): void {
  const checks = checkThemeContrast();
  const allPass = checks.every((c) => c.normalTextPass);

  console.log('\n=== WCAG AA Contrast Check ===\n');
  checks.forEach((check) => {
    const status = check.normalTextPass ? '✓' : '✗';
    console.log(`${status} ${check.pair[1]}: ${check.ratio.toFixed(2)}:1`);
    if (!check.normalTextPass) {
      console.log(`  Required: 4.5:1 for normal text, got ${check.ratio.toFixed(2)}:1`);
    }
  });
  console.log(`\nOverall: ${allPass ? 'PASS ✓' : 'FAIL ✗'}\n`);
}
