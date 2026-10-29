/**
 * Simplified SM-2 SRS algorithm for MVP.
 * TODO: Migrate to FSRS v2 in Phase 2
 */

export interface ReviewResult {
  quality: 0 | 1 | 2 | 3 | 4 | 5; // 0=blackout, 5=perfect
}

export function calculateNextReview(
  currentInterval: number,
  currentEase: number,
  quality: ReviewResult["quality"]
): { nextInterval: number; nextEase: number } {
  // SM-2 simplified
  let ease = currentEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease < 1.3) ease = 1.3;

  let interval: number;
  if (quality < 3) {
    interval = 1; // Reset to 1 day on fail
  } else {
    interval = currentInterval === 0 ? 1 : Math.round(currentInterval * ease);
  }

  return { nextInterval: interval, nextEase: ease };
}