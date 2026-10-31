import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

// Database version (increment when schema changes)
const DATABASE_VERSION = 1;
const DATABASE_NAME = 'kanjiku.db';
const DATABASE_ASSET = Asset.fromModule(require('../../assets/database/kanjiku.db'));

let database: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize SQLite database from bundled asset
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) return database;

  try {
    const dbPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
    const dbInfo = await FileSystem.getInfoAsync(dbPath);

    if (!dbInfo.exists) {
      const asset = DATABASE_ASSET;
      await asset.downloadAsync();

      const assetUri = asset.localUri || asset.uri;
      if (!assetUri) throw new Error('Database asset URI not found');

      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite`, { intermediates: true });
      await FileSystem.copyAsync({ from: assetUri, to: dbPath });
    }

    database = SQLite.openDatabaseSync(DATABASE_NAME);
    console.log('✅ Database initialized:', dbPath);

    return database;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Execute a SQL query with parameters (synchronous)
 */
export function executeSQL(sql: string, params: any[] = []): any {
  const db = getDatabaseSync();
  
  try {
    const results = db.getAllSync(sql, params);
    return {
      rows: {
        length: results.length,
        item: (index: number) => results[index],
        _array: results,
      },
      rowsAffected: 0,
    };
  } catch (error) {
    console.error('SQL error:', sql, params, error);
    throw error;
  }
}

/**
 * Get database sync (must be initialized first)
 */
export function getDatabaseSync(): SQLite.SQLiteDatabase {
  if (!database) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return database;
}

/**
 * Get a kanji by character
 */
export function getKanjiByCharacter(character: string): any {
  const result = executeSQL(`SELECT * FROM kanji WHERE character = ?`, [character]);
  return result.rows.length > 0 ? result.rows.item(0) : null;
}

/**
 * Get a kanji by ID
 */
export function getKanjiById(id: string): any {
  const result = executeSQL(`SELECT * FROM kanji WHERE id = ?`, [id]);
  return result.rows.length > 0 ? result.rows.item(0) : null;
}

/**
 * Get random kanji for widget display
 */
export function getRandomKanjiForWidget(count: number = 1): any[] {
  const result = executeSQL(
    `SELECT * FROM kanji ORDER BY RANDOM() LIMIT ?`,
    [count]
  );
  const items: any[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    items.push(result.rows.item(i));
  }
  return items;
}

/**
 * Get widget queue entries due before timestamp
 */
export function getDueWidgetEntries(
  widgetId: string,
  beforeTimestamp: number
): any[] {
  const result = executeSQL(
    `SELECT * FROM widget_queue WHERE widget_id = ? AND due_at <= ? ORDER BY due_at`,
    [widgetId, beforeTimestamp]
  );
  const items: any[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    items.push(result.rows.item(i));
  }
  return items;
}

/**
 * Get next pending queue entry
 */
export function getNextQueueEntry(): any | null {
  const result = executeSQL(
    `SELECT * FROM widget_queue WHERE status = 'pending' AND due_at <= ? ORDER BY due_at ASC LIMIT 1`,
    [Date.now()]
  );
  if (result.rows.length === 0) return null;
  return result.rows.item(0);
}

/**
 * Mark queue entry as displayed
 */
export function markQueueEntryDisplayed(queueId: string): void {
  executeSQL(
    `UPDATE widget_queue SET status = 'displayed', displayed_at = ? WHERE id = ?`,
    [Date.now(), queueId]
  );
}

/**
 * Get queue statistics
 */
export function getQueueStats(): {
  pending: number;
  displayed: number;
  skipped: number;
  oldest: number | null;
  newest: number | null;
} {
  const result = executeSQL(`
    SELECT
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'displayed' THEN 1 ELSE 0 END) as displayed,
      SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped,
      MIN(due_at) as oldest,
      MAX(due_at) as newest
    FROM widget_queue
  `);
  const row = result.rows.item(0);
  return {
    pending: row?.pending || 0,
    displayed: row?.displayed || 0,
    skipped: row?.skipped || 0,
    oldest: row?.oldest || null,
    newest: row?.newest || null,
  };
}

/**
 * Clean up queue entries older than duration (hours)
 */
export function cleanupOldQueueEntries(olderThanHours: number = 48): number {
  const cutoff = Date.now() - olderThanHours * 3600000;
  const db = getDatabaseSync();
  const res = db.runSync(
    `DELETE FROM widget_queue WHERE (status = 'displayed' OR status = 'skipped') AND due_at < ?`,
    [cutoff]
  );
  return res.changes || 0;
}

/**
 * SRS REVIEW FUNCTIONS
 * Using srs_reviews table created in data-pipeline
 */

export interface SRSReview {
  id: string;
  kanji_id: string;
  user_id: string;
  interval: number;
  ease: number;
  repetitions: number;
  lapses: number;
  next_review_at: number;
  difficulty: number;
  last_reviewed_at: number;
}

/**
 * Get or create SRS review entry for a kanji
 */
export function getOrCreateSRSReview(kanjiId: string, userId: string = 'default'): SRSReview {
  const result = executeSQL(
    `SELECT * FROM srs_reviews WHERE kanji_id = ? AND user_id = ?`,
    [kanjiId, userId]
  );
  
  if (result.rows.length > 0) {
    return result.rows.item(0) as SRSReview;
  }
  
  // Create new entry
  const newId = `srs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  executeSQL(
    `INSERT INTO srs_reviews (id, kanji_id, user_id, interval, ease, repetitions, lapses, next_review_at, difficulty, last_reviewed_at)
     VALUES (?, ?, ?, 1, 2.5, 0, 0, ?, 0.5, ?)`,
    [newId, kanjiId, userId, Math.floor(Date.now() / 1000) + 86400, Math.floor(Date.now() / 1000)]
  );
  
  return getOrCreateSRSReview(kanjiId, userId) as SRSReview;
}

/**
 * Update SRS review after grading
 */
export function updateSRSReview(
  kanjiId: string,
  userId: string,
  grade: number,
  now: number = Date.now()
): SRSReview {
  const entry = getOrCreateSRSReview(kanjiId, userId);
  
  // Use calculateNextReview logic (inline to avoid circular deps)
  const MIN_EASE = 1.3;
  let interval = entry.interval;
  let ease = entry.ease;
  let repetitions = entry.repetitions;
  let lapses = entry.lapses;
  
  if (grade >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * ease);
    repetitions += 1;
    ease = ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  } else {
    repetitions = 0;
    interval = 1;
    ease = Math.max(MIN_EASE, ease - 0.2);
    lapses += 1;
  }
  ease = Math.max(MIN_EASE, ease);
  
  const nextReviewAt = Math.floor(now / 1000) + (interval * 24 * 60 * 60);
  
  executeSQL(
    `UPDATE srs_reviews 
     SET interval = ?, ease = ?, repetitions = ?, lapses = ?, 
         next_review_at = ?, difficulty = ?, last_reviewed_at = ?
     WHERE kanji_id = ? AND user_id = ?`,
    [interval, ease, repetitions, lapses, nextReviewAt, 0.5, Math.floor(now / 1000), kanjiId, userId]
  );
  
  return getOrCreateSRSReview(kanjiId, userId) as SRSReview;
}

/**
 * Get due SRS reviews for review session
 */
export function getDueSRSReviews(
  userId: string = 'default',
  limit: number = 20
): (SRSReview & { character: string; meanings_id: string })[] {
  const nowSec = Math.floor(Date.now() / 1000);
  const result = executeSQL(
    `SELECT sr.*, k.character, k.meanings_id
     FROM srs_reviews sr
     JOIN kanji k ON sr.kanji_id = k.id
     WHERE sr.user_id = ? AND sr.next_review_at <= ?
     ORDER BY sr.next_review_at ASC
     LIMIT ?`,
    [userId, nowSec, limit]
  );
  
  const items: (SRSReview & { character: string; meanings_id: string })[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    items.push(result.rows.item(i) as any);
  }
  return items;
}

/**
 * Get total review count statistics
 */
export function getSRSStats(userId: string = 'default'): {
  total: number;
  due: number;
  learning: number;
  mature: number;
} {
  const nowSec = Math.floor(Date.now() / 1000);
  
  const totalResult = executeSQL(
    `SELECT COUNT(*) as count FROM srs_reviews WHERE user_id = ?`,
    [userId]
  );
  const dueResult = executeSQL(
    `SELECT COUNT(*) as count FROM srs_reviews WHERE user_id = ? AND next_review_at <= ?`,
    [userId, nowSec]
  );
  const learningResult = executeSQL(
    `SELECT COUNT(*) as count FROM srs_reviews WHERE user_id = ? AND repetitions < 5`,
    [userId]
  );
  const matureResult = executeSQL(
    `SELECT COUNT(*) as count FROM srs_reviews WHERE user_id = ? AND repetitions >= 5`,
    [userId]
  );
  
  return {
    total: totalResult.rows.item(0)?.count || 0,
    due: dueResult.rows.item(0)?.count || 0,
    learning: learningResult.rows.item(0)?.count || 0,
    mature: matureResult.rows.item(0)?.count || 0,
  };
}