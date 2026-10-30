import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
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
    // Check if database exists in app's SQLite directory
    const dbPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
    const dbInfo = await FileSystem.getInfoAsync(dbPath);

    if (!dbInfo.exists) {
      // Copy database from asset
      const asset = DATABASE_ASSET;
      await asset.downloadAsync(); // Ensure asset is downloaded

      const assetUri = asset.localUri || asset.uri;
      if (!assetUri) throw new Error('Database asset URI not found');

      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite`, { intermediates: true });
      await FileSystem.copyAsync({ from: assetUri, to: dbPath });
    }

    // Open database
    database = SQLite.openDatabase(DATABASE_NAME);
    console.log('✅ Database initialized:', dbPath);

    return database;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Execute a SQL query with parameters
 */
export async function executeSQL<T = any>(
  sql: string,
  params: any[] = []
): Promise<SQLite.SQLResultSet> {
  const db = await initDatabase();
  
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          console.error('SQL error:', sql, params, error);
          reject(error);
          return false;
        }
      );
    });
  });
}

/**
 * Get a kanji by character
 */
export async function getKanjiByCharacter(character: string): Promise<any> {
  const result = await executeSQL(
    `SELECT * FROM kanji WHERE character = ?`,
    [character]
  );
  return result.rows.item(0);
}

/**
 * Get kanji by JLPT level
 */
export async function getKanjiByJlpt(level: 5 | 4 | 3): Promise<any[]> {
  const result = await executeSQL(
    `SELECT * FROM kanji WHERE jlpt = ? ORDER BY character`,
    [level]
  );
  const items = [];
  for (let i = 0; i < result.rows.length; i++) {
    items.push(result.rows.item(i));
  }
  return items;
}

/**
 * Get random kanji for widget queue
 */
export async function getRandomKanjiForWidget(count: number = 10): Promise<any[]> {
  const result = await executeSQL(
    `SELECT * FROM kanji WHERE jlpt IN (5, 4, 3) ORDER BY RANDOM() LIMIT ?`,
    [count]
  );
  const items = [];
  for (let i = 0; i < result.rows.length; i++) {
    items.push(result.rows.item(i));
  }
  return items;
}

/**
 * Add a kanji to widget queue
 */
export async function addToWidgetQueue(
  widgetId: string,
  kanjiId: string,
  dueAt: number
): Promise<void> {
  await executeSQL(
    `INSERT INTO widget_queue (id, widget_id, kanji_id, due_at, created_at) VALUES (?, ?, ?, ?, ?)`,
    [`${widgetId}_${Date.now()}`, widgetId, kanjiId, dueAt, Math.floor(Date.now() / 1000)]
  );
}

/**
 * Get widget queue entries due before timestamp
 */
export async function getDueWidgetEntries(
  widgetId: string,
  beforeTimestamp: number
): Promise<any[]> {
  const result = await executeSQL(
    `SELECT * FROM widget_queue WHERE widget_id = ? AND due_at <= ? ORDER BY due_at`,
    [widgetId, beforeTimestamp]
  );
  const items = [];
  for (let i = 0; i < result.rows.length; i++) {
    items.push(result.rows.item(i));
  }
  return items;
}

/**
 * Get next pending queue entry
 */
export async function getNextQueueEntry(): Promise<any | null> {
  const result = await executeSQL(
    `SELECT * FROM widget_queue WHERE status = 'pending' AND due_at <= ? ORDER BY due_at ASC LIMIT 1`,
    [Date.now()]
  );
  if (result.rows.length === 0) return null;
  return result.rows.item(0);
}

/**
 * Mark queue entry as displayed
 */
export async function markQueueEntryDisplayed(queueId: string): Promise<void> {
  await executeSQL(
    `UPDATE widget_queue SET status = 'displayed', displayed_at = ? WHERE id = ?`,
    [Date.now(), queueId]
  );
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  pending: number;
  displayed: number;
  skipped: number;
  oldest: number | null;
  newest: number | null;
}> {
  const result = await executeSQL(`
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
    pending: row.pending || 0,
    displayed: row.displayed || 0,
    skipped: row.skipped || 0,
    oldest: row.oldest || null,
    newest: row.newest || null,
  };
}

/**
 * Clean up queue entries older than duration (hours)
 */
export async function cleanupOldQueueEntries(olderThanHours: number = 48): Promise<number> {
  const cutoff = Date.now() - olderThanHours * 3600000;
  const result = await executeSQL(
    `DELETE FROM widget_queue WHERE (status = 'displayed' OR status = 'skipped') AND due_at < ?`,
    [cutoff]
  );
  return result.rowsAffected || 0;
}