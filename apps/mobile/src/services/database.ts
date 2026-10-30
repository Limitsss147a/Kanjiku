import 'react-native-get-random-values';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { v4 as uuidv4 } from 'uuid';
import { Kanji } from '../types/kanjiku';

// Database version (increment when schema changes)
const DATABASE_VERSION = 1;
const DATABASE_NAME = 'kanjiku.db';
const DATABASE_ASSET = Asset.fromModule(require('../../assets/database/kanjiku.db'));
const SQLITE_DIR = `${FileSystem.documentDirectory}SQLite`;
const DB_PATH = `${SQLITE_DIR}/${DATABASE_NAME}`;

let database: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function runQuery(
  db: SQLite.SQLiteDatabase,
  sql: string,
  params: any[] = []
): Promise<SQLite.SQLResultSet> {
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

async function copyDatabaseFromAsset(): Promise<void> {
  const asset = DATABASE_ASSET;
  await asset.downloadAsync();

  const assetUri = asset.localUri || asset.uri;
  if (!assetUri) throw new Error('Database asset URI not found');

  await FileSystem.makeDirectoryAsync(SQLITE_DIR, { intermediates: true });

  // Copy to a temp file first so an interrupted copy never leaves a partial DB in place
  const tmpPath = `${DB_PATH}.${Date.now()}.tmp`;
  try {
    await FileSystem.copyAsync({ from: assetUri, to: tmpPath });
    await FileSystem.deleteAsync(DB_PATH, { idempotent: true });
    await FileSystem.moveAsync({ from: tmpPath, to: DB_PATH });
  } finally {
    await FileSystem.deleteAsync(tmpPath, { idempotent: true });
  }
}

async function openAndValidate(): Promise<SQLite.SQLiteDatabase> {
  const db = SQLite.openDatabase(DATABASE_NAME);
  try {
    await runQuery(db, 'SELECT id FROM kanji LIMIT 1');
    return db;
  } catch (error) {
    (db as { closeAsync?: () => unknown }).closeAsync?.();
    throw error;
  }
}

async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const dbInfo = await FileSystem.getInfoAsync(DB_PATH);
  if (!dbInfo.exists) {
    await copyDatabaseFromAsset();
    return openAndValidate();
  }

  try {
    return await openAndValidate();
  } catch (error) {
    console.warn('Existing database is invalid, restoring from asset:', error);
    await copyDatabaseFromAsset();
    return openAndValidate();
  }
}

/**
 * Initialize SQLite database from bundled asset.
 * Concurrent callers share a single in-flight initialization.
 */
export function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) return Promise.resolve(database);

  if (!initPromise) {
    initPromise = initializeDatabase()
      .then(db => {
        database = db;
        console.log('✅ Database initialized:', DB_PATH);
        return db;
      })
      .catch(error => {
        initPromise = null;
        console.error('❌ Database initialization failed:', error);
        throw error;
      });
  }

  return initPromise;
}

/**
 * Execute a SQL query with parameters
 */
export async function executeSQL(
  sql: string,
  params: any[] = []
): Promise<SQLite.SQLResultSet> {
  const db = await initDatabase();
  return runQuery(db, sql, params);
}

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || value === '') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapKanjiRow(row: any): Kanji {
  return {
    ...row,
    meanings_en: parseJsonArray(row.meanings_en),
    meanings_id: parseJsonArray(row.meanings_id),
    readings_on: parseJsonArray(row.readings_on),
    readings_kun: parseJsonArray(row.readings_kun),
  };
}

function mapKanjiRows(result: SQLite.SQLResultSet): Kanji[] {
  const items: Kanji[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    items.push(mapKanjiRow(result.rows.item(i)));
  }
  return items;
}

/**
 * Get a kanji by character
 */
export async function getKanjiByCharacter(character: string): Promise<Kanji | null> {
  const result = await executeSQL(
    `SELECT * FROM kanji WHERE character = ?`,
    [character]
  );
  return result.rows.length > 0 ? mapKanjiRow(result.rows.item(0)) : null;
}

/**
 * Get kanji by JLPT level
 */
export async function getKanjiByJlpt(level: 5 | 4 | 3): Promise<Kanji[]> {
  const result = await executeSQL(
    `SELECT * FROM kanji WHERE jlpt = ? ORDER BY character`,
    [level]
  );
  return mapKanjiRows(result);
}

/**
 * Get random kanji for widget queue
 */
export async function getRandomKanjiForWidget(count: number = 10): Promise<Kanji[]> {
  const result = await executeSQL(
    `SELECT * FROM kanji WHERE jlpt IN (5, 4, 3) ORDER BY RANDOM() LIMIT ?`,
    [count]
  );
  return mapKanjiRows(result);
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
    [uuidv4(), widgetId, kanjiId, dueAt, Math.floor(Date.now() / 1000)]
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