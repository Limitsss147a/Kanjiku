/**
 * Design Tokens — Sistem desain Kanjiku
 * Warna, radius, shadow, motion, texture
 */

export const colors = {
  // Washi (light) palette
  washi: {
    bg: '#F9F7F4',
    surface: '#FEFCFA',
    text: '#3C3C3C',
    textSecondary: '#7C7C7C',
    accent: '#D4845C',
    border: '#E8DDD3',
    divider: '#F0E8E0',
  },
  // Sumi (dark) palette
  sumi: {
    bg: '#2C2C2C',
    surface: '#1A1A1A',
    text: '#F5F5F5',
    textSecondary: '#B0B0B0',
    accent: '#E8B4A1',
    border: '#4A4A4A',
    divider: '#3A3A3A',
  },
  // JLPT level badges
  jlpt: {
    n5: '#4CAF50',
    n4: '#2196F3',
    n3: '#FF9800',
    n2: '#F44336',
    n1: '#9C27B0',
  },
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const shadow = {
  xs: { elevation: 2, shadowOpacity: 0.08 },
  sm: { elevation: 4, shadowOpacity: 0.12 },
  md: { elevation: 8, shadowOpacity: 0.15 },
  lg: { elevation: 16, shadowOpacity: 0.20 },
} as const;

export const motion = {
  // Duration in milliseconds
  micro: 150,
  short: 200,
  base: 300,
  long: 500,
  veryLong: 800,

  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    cubic: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
} as const;

export const typography = {
  display: { size: 32, weight: 700, lineHeight: 1.2 },
  headline: { size: 24, weight: 600, lineHeight: 1.3 },
  title: { size: 20, weight: 600, lineHeight: 1.4 },
  body: { size: 16, weight: 400, lineHeight: 1.5 },
  bodySmall: { size: 14, weight: 400, lineHeight: 1.4 },
  label: { size: 12, weight: 500, lineHeight: 1.4 },
  caption: { size: 11, weight: 400, lineHeight: 1.3 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type Theme = 'washi' | 'sumi';
export type ColorScheme = typeof colors.washi;
