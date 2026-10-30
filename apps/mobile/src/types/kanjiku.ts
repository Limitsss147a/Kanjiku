// Kanjiku types - mirrors packages/shared/src/types.ts
// Used directly in mobile app for now (no workspace symlink yet)

export interface Kanji {
  id: string;
  character: string;
  unicode: string;
  jlpt: number;
  strokes: number | null;
  grade: number | null;
  meaning: string | null;
  meanings_en: string[];
  meanings_id: string[];
  readings_on: string[];
  readings_kun: string[];
  radical: string | null;
  svg_filename: string | null;
  created_at: number;
}

export interface WidgetConfig {
  widget_id: string;
  interval: number;
  source: string;
  order_mode: string;
  theme: string;
  active_schedule_enabled: number;
  active_schedule_start: number;
  active_schedule_end: number;
  created_at: number;
  updated_at: number;
}

export interface QueueEntry {
  id: string;
  widget_id: string;
  kanji_id: string;
  due_at: number;
  displayed_count: number;
  last_displayed_at: number | null;
  created_at: number;
}

export interface SRSEntry {
  id: string;
  kanji_id: string;
  user_id: string;
  interval: number;
  ease: number;
  repetitions: number;
  lapses: number;
  next_review_at: number | null;
  difficulty: number;
  last_reviewed_at: number | null;
  created_at: number;
}

// Helper type for JSON string fields
export type JsonField<T> = T extends string ? T[] : never;