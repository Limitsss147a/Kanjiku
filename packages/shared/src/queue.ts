import { Kanji, QueueEntry } from './types';

export interface QueueStats {
  pending: number;
  displayed: number;
  skipped: number;
  oldest: string | null;
  newest: string | null;
}

export interface QueueGenerationOptions {
  interval: number; // minutes between entries
  duration: number; // hours to fill (e.g., 48)
  threshold: number; // min pending before regenerating
}

export const DEFAULT_QUEUE_OPTIONS: QueueGenerationOptions = {
  interval: 15, // 15-min widget update interval
  duration: 48, // 48-hour rolling window
  threshold: 96, // (48 * 60) / 15 = 192; regenerate when < 96
};

export interface SRSWeights {
  new: number; // 0 reviews
  learning: number; // 1-10 reviews, ease < 2.0
  known: number; // ease >= 2.0, not due
  due: number; // due <= 0
}

export const DEFAULT_SRS_WEIGHTS: SRSWeights = {
  new: 0.4,
  learning: 0.3,
  known: 0.2,
  due: 0.1,
};

/**
 * Generate queue entries for a 48-hour rolling window at 15-min intervals.
 * @param allKanji All available kanji (from DB)
 * @param userDeck User's kanji IDs with SRS data
 * @param options Generation options (interval, duration, threshold)
 * @param weights SRS category weights
 * @returns Array of QueueEntry objects ready for insertion
 */
export function generateQueue(
  allKanji: Kanji[],
  userDeck: Array<{ kanjiId: string; ease: number; repetitions: number; nextReviewAt: number }>,
  options: Partial<QueueGenerationOptions> = {},
  weights: Partial<SRSWeights> = {}
): QueueEntry[] {
  const opts = { ...DEFAULT_QUEUE_OPTIONS, ...options };
  const w = { ...DEFAULT_SRS_WEIGHTS, ...weights };

  const now = Date.now();
  const entries: QueueEntry[] = [];
  const count = (opts.duration * 60) / opts.interval; // e.g., (48 * 60) / 15 = 192

  // Build weighted pool: new(40%), learning(30%), known(20%), due(10%)
  const categorized = categorizeUserDeck(userDeck);
  const pool = buildWeightedPool(
    allKanji,
    categorized,
    w
  );

  if (pool.length === 0) {
    // Fallback: use all kanji if user deck is empty
    const nowMs = Date.now();
    return allKanji.slice(0, count).map((kanji, i) => ({
      id: `${kanji.id}-${i}`,
      widgetId: 'default',
      kanjiId: kanji.id,
      dueAt: nowMs + i * opts.interval * 60000,
      displayedCount: 0,
      createdAt: nowMs,
    }));
  }

  // Generate entries
  for (let i = 0; i < count; i++) {
    const kanji = pool[Math.floor(Math.random() * pool.length)];
    const dueAt = now + i * opts.interval * 60000;

    entries.push({
      id: `${kanji.id}-${i}`,
      widgetId: 'default',
      kanjiId: kanji.id,
      dueAt: dueAt,
      displayedCount: 0,
      createdAt: now,
    });
  }

  return entries;
}

/**
 * Categorize user deck by SRS status.
 */
function categorizeUserDeck(
  userDeck: Array<{ kanjiId: string; ease: number; repetitions: number; nextReviewAt: number }>
) {
  const now = Date.now();
  return {
    new: userDeck.filter((u) => u.repetitions === 0),
    learning: userDeck.filter((u) => u.repetitions > 0 && u.repetitions <= 10 && u.ease < 2.0),
    known: userDeck.filter((u) => u.ease >= 2.0 && u.nextReviewAt > now),
    due: userDeck.filter((u) => u.nextReviewAt <= now),
  };
}

/**
 * Build weighted pool of kanji from user deck.
 * Repeats kanji proportionally to their SRS category.
 */
function buildWeightedPool(
  allKanji: Kanji[],
  categorized: ReturnType<typeof categorizeUserDeck>,
  weights: SRSWeights
): Kanji[] {
  const pool: Kanji[] = [];
  const kanjiById = new Map(allKanji.map((k) => [k.id, k]));

  // Assume 192 total entries for 48h:
  // - 40% new = 76
  // - 30% learning = 57
  // - 20% known = 38
  // - 10% due = 19
  const baseCount = 192;

  const counts = {
    new: Math.round(baseCount * weights.new),
    learning: Math.round(baseCount * weights.learning),
    known: Math.round(baseCount * weights.known),
    due: Math.round(baseCount * weights.due),
  };

  // Distribute kanji from each category
  const addCategory = (items: typeof categorized.new, count: number) => {
    for (let i = 0; i < count; i++) {
      const item = items[i % items.length];
      const kanji = kanjiById.get(item.kanjiId);
      if (kanji) pool.push(kanji);
    }
  };

  if (categorized.new.length > 0) addCategory(categorized.new, counts.new);
  if (categorized.learning.length > 0) addCategory(categorized.learning, counts.learning);
  if (categorized.known.length > 0) addCategory(categorized.known, counts.known);
  if (categorized.due.length > 0) addCategory(categorized.due, counts.due);

  return pool.slice(0, baseCount); // Trim to exact count
}

/**
 * Clean up queue entries older than a given duration.
 * @param db Database connection (sql.js or SQLite3 compatible)
 * @param olderThanHours Delete entries older than this many hours (default 48)
 * @returns Number of rows deleted
 */
export function cleanupOldQueueEntries(db: any, olderThanHours: number = 48): number {
  const cutoff = Date.now() - olderThanHours * 3600000;
  // Only delete entries that were already displayed or are stale pending
  const stmt = db.prepare(`
    DELETE FROM widget_queue
    WHERE (status = 'displayed' OR status = 'skipped')
      AND dueAt < ?
  `);
  stmt.run([cutoff]);
  const changes = db.getRowsModified?.() || 0;
  return changes;
}

/**
 * Get queue statistics.
 */
export function getQueueStats(db: any): QueueStats {
  const result = db.exec(`
    SELECT
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'displayed' THEN 1 ELSE 0 END) as displayed,
      SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped,
      MIN(scheduled_at) as oldest,
      MAX(scheduled_at) as newest
    FROM widget_queue
  `);

  if (!result || result.length === 0) {
    return { pending: 0, displayed: 0, skipped: 0, oldest: null, newest: null };
  }

  const row = result[0].values[0];
  return {
    pending: row[0] || 0,
    displayed: row[1] || 0,
    skipped: row[2] || 0,
    oldest: row[3] as string | null,
    newest: row[4] as string | null,
  };
}

/**
 * Get next pending queue entry.
 */
export function getNextQueueEntry(db: any): QueueEntry | null {
  const result = db.exec(`
    SELECT id, kanji_id, scheduled_at, displayed_at, status, widget_id
    FROM widget_queue
    WHERE status = 'pending' AND scheduled_at <= datetime('now')
    ORDER BY scheduled_at ASC
    LIMIT 1
  `);

  if (!result || result.length === 0) return null;

  const row = result[0].values[0];
  return {
    id: row[0],
    widgetId: row[5] as string,
    kanjiId: row[1],
    dueAt: new Date(row[2] as string).getTime(),
    displayedCount: 0,
    createdAt: new Date(row[2] as string).getTime(),
  };
}

/**
 * Mark a queue entry as displayed.
 */
export function markQueueEntryDisplayed(db: any, queueId: string): void {
  db.run(`
    UPDATE widget_queue
    SET status = 'displayed', displayed_at = datetime('now')
    WHERE id = ?
  `, [queueId]);
}
