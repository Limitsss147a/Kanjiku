import { SRSEntry } from '../types/kanjiku';

/**
 * Simplified SM-2 Spaced Repetition Algorithm
 * Based on: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 * 
 * TODO: Migrate to FSRS v2 in Phase 2 for better accuracy
 */

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

export type SRSGrade = 0 | 1 | 2 | 3 | 4 | 5;

export interface SRSResult {
  interval: number;
  ease: number;
  repetitions: number;
  lapses: number;
  next_review_at: number;
}

/**
 * Calculate next review date using SM-2
 */
export function calculateNextReview(
  entry: Partial<SRSEntry>,
  grade: SRSGrade,
  now: number = Date.now()
): SRSResult {
  let interval = entry.interval ?? 1;
  let ease = entry.ease ?? DEFAULT_EASE;
  let repetitions = entry.repetitions ?? 0;
  let lapses = entry.lapses ?? 0;

  if (grade >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease);
    }
    repetitions += 1;
  } else {
    // Incorrect response
    repetitions = 0;
    interval = 1;
    lapses += 1;
  }

  // SM-2 ease adjustment applies to every grade, so blackouts are penalized more than near misses
  ease = Math.max(MIN_EASE, ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));

  // Calculate next review timestamp (in seconds)
  const nextReviewAt = Math.floor(now / 1000) + (interval * 24 * 60 * 60);

  return {
    interval,
    ease,
    repetitions,
    lapses,
    next_review_at: nextReviewAt,
  };
}

/**
 * Get human-readable interval
 */
export function formatInterval(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60));
  if (days < 1) return '< 1 hari';
  if (days === 1) return '1 hari';
  if (days < 7) return `${days} hari`;
  if (days < 30) return `${Math.floor(days / 7)} minggu`;
  if (days < 365) return `${Math.floor(days / 30)} bulan`;
  return `${Math.floor(days / 365)} tahun`;
}