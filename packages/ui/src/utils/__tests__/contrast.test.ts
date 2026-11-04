import { checkThemeContrast } from '../contrast';

describe('contrast utility', () => {
  it('exports checkThemeContrast', () => {
    expect(checkThemeContrast).toBeDefined();
    expect(typeof checkThemeContrast).toBe('function');
  });

  it('returns array of 6 checks (washi + sumi themes)', () => {
    const result = checkThemeContrast();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(6);
  });

  it('each check has required properties', () => {
    const result = checkThemeContrast();
    result.forEach((check) => {
      expect(check).toHaveProperty('pair');
      expect(check).toHaveProperty('ratio');
      expect(check).toHaveProperty('normalTextPass');
      expect(check).toHaveProperty('largeTextPass');
      expect(typeof check.ratio).toBe('number');
      expect(typeof check.normalTextPass).toBe('boolean');
    });
  });

  it('all checks pass WCAG AA (4.5:1)', () => {
    const result = checkThemeContrast();
    const allPass = result.every((c) => c.normalTextPass);
    expect(allPass).toBe(true);
  });

  it('contrast ratios are valid (positive)', () => {
    const result = checkThemeContrast();
    result.forEach((check) => {
      expect(check.ratio).toBeGreaterThan(0);
    });
  });
});
