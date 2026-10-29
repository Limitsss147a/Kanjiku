export interface Kanji {
  id: string;
  character: string;
  unicode: string;
  grade?: number;
  jlpt: 1 | 2 | 3 | 4 | 5;
  strokes: number;
  readings: {
    on: string[];
    kun: string[];
  };
  meanings: {
    en: string;
    id: string;
  };
  radicalId?: string;
  examples: {
    word: string;
    reading: string;
    meaningEn: string;
    meaningId: string;
  }[];
}

export interface WidgetConfig {
  widgetId: string;
  interval: 15 | 30 | 60 | 180 | 1440; // minutes
  source: "all" | "jlpt-5" | "jlpt-4" | "jlpt-3" | "jlpt-2" | "jlpt-1" | "custom";
  order: "queue" | "random" | "weakest-first";
  theme: "washi-light" | "washi-dark" | "sumi" | "sakura" | "ai";
  activeSchedule: {
    enabled: boolean;
    startHour: number; // 0-23
    endHour: number; // 0-23
  };
  createdAt: number;
  updatedAt: number;
}

export interface QueueEntry {
  id: string;
  widgetId: string;
  kanjiId: string;
  dueAt: number; // timestamp
  displayedCount: number;
  lastDisplayedAt?: number;
  createdAt: number;
}

export interface SRSEntry {
  id: string;
  kanjiId: string;
  userId: string;
  interval: number; // days (FSRS)
  ease: number; // factor (FSRS v2: 1.3-2.5)
  repetitions: number;
  lapses: number;
  nextReviewAt: number; // timestamp
  difficulty: number; // FSRS: 0-1
  lastReviewedAt: number;
  createdAt: number;
}

export interface WidgetDisplayLog {
  id: string;
  widgetId: string;
  kanjiId: string;
  displayedAt: number;
  durationMs?: number;
}

export const JLPT_LEVELS = {
  5: { name: "N5", count: 79 },
  4: { name: "N4", count: 166 },
  3: { name: "N3", count: 367 },
  2: { name: "N2", count: 650 },
  1: { name: "N1", count: 1238 }
} as const;

export const THEME_COLORS = {
  "washi-light": { bg: "#FBF7EE", text: "#2D2D2D", accent: "#D8452B" },
  "washi-dark": { bg: "#3D3D3D", text: "#F5F5F5", accent: "#E8B4A8" },
  "sumi": { bg: "#1A1A1A", text: "#EFEFEF", accent: "#FF6B6B" },
  "sakura": { bg: "#FFF0F5", text: "#2D2D2D", accent: "#E75480" },
  "ai": { bg: "#E6F4FE", text: "#1F3A93", accent: "#FF6B9D" }
} as const;