// Sakura petal fall animation (continuous loop)
// Base: 2-4s fall duration with rotation + horizontal drift
export const sakuraFall = {
  duration: 3000, // 3s per petal
  keyframes: [
    { offset: 0, opacity: 1, translateY: 0, rotate: 0 },
    { offset: 0.5, opacity: 1, translateY: '50%', rotate: 180 },
    { offset: 1, opacity: 0, translateY: '100%', rotate: 360 },
  ],
  timing: {
    easing: 'linear',
    useNativeDriver: false, // opacity requires native false
  },
};

export const petalDrift = {
  duration: 2000,
  easing: 'ease-in-out',
  oscillations: 3, // side-to-side sway
};

export const sakuraConfig = {
  petalCount: 8,
  spawnRate: 500, // ms between spawns
  maxConcurrent: 12,
  useNativeDriver: false,
};

// Petal size & color variants
export const petalStyles = {
  tiny: { size: 8, opacity: 0.6 },
  small: { size: 12, opacity: 0.7 },
  medium: { size: 16, opacity: 0.8 },
  large: { size: 20, opacity: 0.9 },
};

// Sakura pink palette
export const sakuraColors = {
  light: '#ffb7d9',  // washi accent
  medium: '#ff9ac9',
  dark: '#ff7eaf',
  night: '#d18fab', // sumi adjusted
};
