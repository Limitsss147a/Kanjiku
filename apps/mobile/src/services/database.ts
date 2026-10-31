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