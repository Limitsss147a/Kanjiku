import { checkBundleSize, analyzeBundle } from '../bundle';

describe('bundle utility', () => {
  it('exports checkBundleSize', () => {
    expect(checkBundleSize).toBeDefined();
    expect(typeof checkBundleSize).toBe('function');
  });

  it('exports analyzeBundle', () => {
    expect(analyzeBundle).toBeDefined();
    expect(typeof analyzeBundle).toBe('function');
  });

  it('checkBundleSize returns correct structure', () => {
    const result = checkBundleSize(100000, 'js');
    expect(result).toHaveProperty('size');
    expect(result).toHaveProperty('gzipped');
    expect(result).toHaveProperty('threshold');
    expect(result).toHaveProperty('status');
  });

  it('marks status as ok when under threshold', () => {
    const result = checkBundleSize(100000, 'js'); // 100KB raw ≈ 30KB gzipped
    expect(result.status).toBe('ok');
    expect(result.gzipped).toBeLessThan(result.threshold);
  });

  it('marks status as warning when over threshold', () => {
    const result = checkBundleSize(600000, 'js'); // 600KB raw ≈ 180KB gzipped > 150KB threshold
    expect(result.status).toBe('warning');
  });

  it('marks status as critical when significantly over threshold', () => {
    const result = checkBundleSize(1000000, 'js'); // 1MB raw ≈ 300KB gzipped > 150KB threshold
    expect(result.status).toBe('critical');
  });

  it('analyzeBundle returns readable string', () => {
    const ok = checkBundleSize(100000, 'js');
    const warning = checkBundleSize(600000, 'js');
    const critical = checkBundleSize(1000000, 'js');

    expect(analyzeBundle(ok)).toContain('OK');
    expect(analyzeBundle(warning)).toContain('WARNING');
    expect(analyzeBundle(critical)).toContain('CRITICAL');
  });

  it('calculates gzipped estimate correctly', () => {
    const result = checkBundleSize(100000, 'js');
    // Gzipped should be ~30% of original
    expect(result.gzipped).toBe(30000); // Math.floor(100000 * 0.3)
  });
});
