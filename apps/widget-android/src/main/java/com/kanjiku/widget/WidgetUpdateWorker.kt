package com.kanjiku.widget

import android.content.Context
import android.content.SharedPreferences
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.util.Log
import androidx.glance.appwidget.updateAll
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import java.io.File
import java.util.Calendar

private const val TAG = "WidgetUpdateWorker"

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
            // Step 0: Check if database is available
            if (!KanjiDbHelper.isDatabaseAvailable(context)) {
                Log.w(TAG, "Database not available, skipping update")
                return@withContext Result.success()
            }

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
            Log.e(TAG, "Worker failed", e)
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
                SELECT wq.id as queue_id, k.character, k.on_readings, k.kun_readings, k.meanings_id, k.jlpt_level
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
            val readingOn = cursor.getString(cursor.getColumnIndexOrThrow("on_readings"))
            val readingKun = cursor.getString(cursor.getColumnIndexOrThrow("kun_readings"))
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
        return try {
            val parts = mutableListOf<String>()
            
            // Parse JSON arrays
            if (!on.isNullOrBlank() && on != "null") {
                val onArray = JSONArray(on)
                for (i in 0 until onArray.length()) {
                    parts.add(onArray.getString(i).uppercase())
                }
            }
            
            if (!kun.isNullOrBlank() && kun != "null") {
                val kunArray = JSONArray(kun)
                for (i in 0 until kunArray.length()) {
                    parts.add(kunArray.getString(i).lowercase())
                }
            }
            
            if (parts.isEmpty()) "-" else parts.take(3).joinToString(" / ")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to parse readings: on=$on, kun=$kun", e)
            "-"
        }
    }

    private fun formatMeaning(meaningsJson: String?): String {
        return try {
            val jsonArray = JSONArray(meaningsJson ?: "[]")
            if (jsonArray.length() > 0) jsonArray.getString(0) else "-"
        } catch (e: Exception) {
            Log.w(TAG, "Failed to parse meanings: $meaningsJson", e)
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

