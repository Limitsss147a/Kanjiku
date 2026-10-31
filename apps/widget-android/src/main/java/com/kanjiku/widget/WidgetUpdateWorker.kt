package com.kanjiku.widget

import android.content.Context
import android.content.SharedPreferences
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import androidx.glance.appwidget.updateAll
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.util.Calendar

/**
 * Worker executed every 15 minutes by WorkManager.
 *
 * Responsibilities:
 * 1. Check if current time is within active schedule (07:00 - 22:00 by default)
 * 2. Read next kanji from SQLite queue (shared with React Native app)
 * 3. Update widget state via Glance
 */
class WidgetUpdateWorker(
    private val context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    private val dbHelper by lazy { KanjiDbHelper(context) }
    private val prefs by lazy { context.getSharedPreferences("kanjiku_widget_prefs", Context.MODE_PRIVATE) }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        return@withContext try {
            // Step 1: Check active schedule (skip if night mode)
            if (!isWithinActiveHours()) {
                return@withContext Result.success()
            }

            // Step 2: Read next kanji from SQLite queue
            val kanji = readNextKanjiFromQueue()
            if (kanji == null) {
                // No kanji in queue - could trigger mobile app sync or show placeholder
                return@withContext Result.success()
            }

            // Step 3: Save kanji to shared preferences for widget to display
            saveKanjiToPrefs(kanji)

            // Step 4: Trigger Glance widget redraw
            KanjiWidget().updateAll(context)

            Result.success()
        } catch (e: Exception) {
            // Exponential backoff retry on failure
            Result.retry()
        }
    }

    /**
     * Check if current time is within active hours (default 07:00 - 22:00).
     * User can override via shared preferences.
     */
    private fun isWithinActiveHours(): Boolean {
        val cal = Calendar.getInstance()
        val hour = cal.get(Calendar.HOUR_OF_DAY)

        val startHour = prefs.getInt("schedule_start_hour", 7)
        val endHour = prefs.getInt("schedule_end_hour", 22)

        return hour >= startHour && hour < endHour
    }

    /**
     * Read next pending kanji from the widget_queue table.
     * The queue is populated by the React Native app (via shared package queue.ts).
     * We read the earliest pending entry, mark it displayed, and return the kanji data.
     */
    private fun readNextKanjiFromQueue(): KanjiDisplayData? {
        val db = dbHelper.readableDatabase
        return try {
            // Find next pending queue entry due now
            val cursor = db.rawQuery(
                """
                SELECT wq.id as queue_id, k.character, k.reading_on, k.reading_kun, k.meanings_id, k.jlpt_level
                FROM widget_queue wq
                JOIN kanji k ON wq.kanji_id = k.id
                WHERE wq.status = 'pending' AND wq.due_at <= ?
                ORDER BY wq.due_at ASC
                LIMIT 1
                """.trimIndent(),
                arrayOf((System.currentTimeMillis() / 1000).toString())
            )

            if (!cursor.moveToFirst()) {
                cursor.close()
                return null
            }

            val queueId = cursor.getString(cursor.getColumnIndexOrThrow("queue_id"))
            val character = cursor.getString(cursor.getColumnIndexOrThrow("character"))
            val readingOn = cursor.getString(cursor.getColumnIndexOrThrow("reading_on"))
            val readingKun = cursor.getString(cursor.getColumnIndexOrThrow("reading_kun"))
            val meaningsId = cursor.getString(cursor.getColumnIndexOrThrow("meanings_id"))
            val jlptLevel = cursor.getInt(cursor.getColumnIndexOrThrow("jlpt_level"))

            cursor.close()

            // Mark queue entry as displayed
            db.execSQL(
                "UPDATE widget_queue SET status = 'displayed', displayed_at = ? WHERE id = ?",
                arrayOf((System.currentTimeMillis() / 1000).toString(), queueId)
            )

            // Format reading and meaning for display
            val reading = formatReading(readingOn, readingKun)
            val meaning = formatMeaning(meaningsId)

            return KanjiDisplayData(
                character = character,
                reading = reading,
                meaningId = meaning,
                jlptLevel = jlptLevel
            )
        } finally {
            // Don't close db - managed by helper
        }
    }

    private fun formatReading(on: String?, kun: String?): String {
        val parts = mutableListOf<String>()
        if (on.isNotBlank()) parts.add(on.uppercase())
        if (kun.isNotBlank()) parts.add(kun.lowercase())
        return if (parts.isEmpty()) "-" else parts.joinToString(" / ")
    }

    private fun formatMeaning(meaningsJson: String?): String {
        return try {
            val jsonArray = org.json.JSONArray(meaningsJson ?: "[]")
            if (jsonArray.length() > 0) jsonArray.getString(0) else "-"
        } catch (e: Exception) {
            meaningsJson ?: "-"
        }
    }

    private fun saveKanjiToPrefs(kanji: KanjiDisplayData) {
        prefs.edit()
            .putString("current_kanji_character", kanji.character)
            .putString("current_kanji_reading", kanji.reading)
            .putString("current_kanji_meaning", kanji.meaningId)
            .putInt("current_kanji_jlpt", kanji.jlptLevel)
            .apply()
    }
}

/**
 * SQLite helper to access the kanjiku database.
 * Database is copied from React Native app's internal storage to a shared location.
 * For simplicity, we read from the app's internal database path.
 * In production, consider using a ContentProvider or FileProvider for cross-process access.
 */
class KanjiDbHelper(context: Context) : SQLiteOpenHelper(
    context,
    "kanjiku.db",
    null,
    1
) {
    override fun onCreate(db: SQLiteDatabase?) {
        // Database created by mobile app, not here
    }

    override fun onUpgrade(db: SQLiteDatabase?, oldVersion: Int, newVersion: Int) {
        // Handle migrations if needed
    }

    /**
     * Get database path. The React Native app copies the database to its internal
     * files directory. We access it via the package context.
     * Note: This requires the widget app to have the same sharedUserId or
     * the database to be in a shared external directory.
     * For now, we try to find it in the app's internal storage.
     */
    companion object {
        private const val DB_NAME = "kanjiku.db"

        fun getDatabasePath(context: Context): File? {
            // Try to get database from the main app's internal storage
            // This works if both apps share the same UID (sharedUserId in manifest)
            // or if database is placed in a shared external directory.
            try {
                val mainAppContext = context.createPackageContext(
                    "com.kanjiku", // Package name of the main React Native app
                    Context.CONTEXT_IGNORE_SECURITY
                )
                return File(mainAppContext.filesDir.parentFile, "databases/$DB_NAME")
            } catch (e: Exception) {
                // Fallback: check external files directory
                return File(context.getExternalFilesDir(null), "databases/$DB_NAME")
            }
        }
    }
}