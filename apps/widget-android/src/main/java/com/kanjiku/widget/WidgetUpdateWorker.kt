package com.kanjiku.widget

import android.content.Context
import androidx.glance.appwidget.updateAll
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

/**
 * Worker executed every 15 minutes by WorkManager.
 *
 * Responsibilities:
 * 1. Check if current time is within active schedule (e.g., 07:00 - 22:00)
 * 2. Advance the display queue (read next kanji from SQLite)
 * 3. Trigger Glance widget redraw via updateAll()
 */
class WidgetUpdateWorker(
    private val context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            // TODO: Step 1 — Check active schedule (skip if night mode)
            // TODO: Step 2 — Read next kanji from SQLite queue
            // TODO: Step 3 — Update widget state via Glance
            KanjiWidget().updateAll(context)

            Result.success()
        } catch (e: Exception) {
            // Exponential backoff retry on failure
            Result.retry()
        }
    }
}