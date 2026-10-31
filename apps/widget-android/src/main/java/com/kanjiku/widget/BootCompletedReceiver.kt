package com.kanjiku.widget

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequest
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

/**
 * Receives BOOT_COMPLETED and QUICKBOOT_POWERON to reschedule the widget update worker.
 * WorkManager persists work across reboots, but we ensure it's scheduled on first boot
 * and if the user clears app data.
 */
class BootCompletedReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (action == Intent.ACTION_BOOT_COMPLETED || action == "android.intent.action.QUICKBOOT_POWERON") {
            scheduleWidgetUpdateWorker(context)
        }
    }

    companion object {
        private const val WORK_NAME = "KanjiWidgetUpdateWorker"
        private const val INTERVAL_MINUTES = 15L

        fun scheduleWidgetUpdateWorker(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.NOT_REQUIRED)
                .setRequiresCharging(false)
                .build()

            val workRequest = PeriodicWorkRequestBuilder<WidgetUpdateWorker>(INTERVAL_MINUTES, TimeUnit.MINUTES)
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                workRequest
            )
        }

        fun cancelWidgetUpdateWorker(context: Context) {
            WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME)
        }
    }
}