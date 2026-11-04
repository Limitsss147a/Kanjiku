// Bundle size tracking utility
// Usage: npm run bundle:analyze

const thresholds = {
  js: 150000, // 150KB gzipped target
  jsCritical: 50000, // 50KB critical path
  assets: 500000, // 500KB total assets
};

interface BundleStats {
  size: number;
  gzipped: number;
  threshold: number;
  status: 'ok' | 'warning' | 'critical';
}

export function checkBundleSize(size: number, type: 'js' | 'assets' = 'js'): BundleStats {
  const threshold = thresholds[type];
  const gzipped = Math.floor(size * 0.3); // Estimate 70% compression
  const ratio = gzipped / threshold;
  let status: BundleStats['status'] = 'ok';

  if (ratio > 1.2) status = 'critical';
  else if (ratio > 1) status = 'warning';

  return { size, gzipped, threshold, status };
}

export function analyzeBundle(stats: BundleStats): string {
  switch (stats.status) {
    case 'ok':
      return `${stats.gzipped.toLocaleString()}B (OK: ${((1 - stats.gzipped / stats.threshold) * 100).toFixed(0)}% under target)`;
    case 'warning':
      return `${stats.gzipped.toLocaleString()}B (WARNING: ${((stats.gzipped / stats.threshold - 1) * 100).toFixed(0)}% over)`;
    case 'critical':
      return `${stats.gzipped.toLocaleString()}B (CRITICAL: ${((stats.gzipped / stats.threshold - 1) * 100).toFixed(0)}% over)`;
  }
}

// Component lazy load helper
export const lazyLoad = <T>(importer: () => Promise<T>) =>
  importer;
