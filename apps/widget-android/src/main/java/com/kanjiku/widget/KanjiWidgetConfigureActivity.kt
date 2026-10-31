package com.kanjiku.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TimePicker
import androidx.appcompat.app.AppCompatActivity
import android.widget.Toast

/**
 * Configuration activity for the Kanji Widget.
 * Allows user to set active hours schedule (start/end time).
 */
class KanjiWidgetConfigureActivity : AppCompatActivity() {

    private lateinit var startTimePicker: TimePicker
    private lateinit var endTimePicker: TimePicker
    private var appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.widget_configure)

        // Get widget ID from intent
        val extras = intent.extras
        if (extras != null) {
            appWidgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
        }

        // If no valid widget ID, finish
        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish()
            return
        }

        startTimePicker = findViewById(R.id.startTimePicker)
        endTimePicker = findViewById(R.id.endTimePicker)

        // Load existing preferences
        val prefs = getSharedPreferences("kanjiku_widget_prefs", Context.MODE_PRIVATE)
        startTimePicker.hour = prefs.getInt("schedule_start_hour", 7)
        startTimePicker.minute = prefs.getInt("schedule_start_minute", 0)
        endTimePicker.hour = prefs.getInt("schedule_end_hour", 22)
        endTimePicker.minute = prefs.getInt("schedule_end_minute", 0)

        findViewById<Button>(R.id.saveButton).setOnClickListener {
            saveConfiguration()
        }
    }

    private fun saveConfiguration() {
        val prefs = getSharedPreferences("kanjiku_widget_prefs", Context.MODE_PRIVATE)
        val startHour = startTimePicker.hour
        val startMinute = startTimePicker.minute
        val endHour = endTimePicker.hour
        val endMinute = endTimePicker.minute

        // Validate: end must be after start
        val startMinutes = startHour * 60 + startMinute
        val endMinutes = endHour * 60 + endMinute
        if (endMinutes <= startMinutes) {
            Toast.makeText(this, "Waktu selesai harus setelah waktu mulai", Toast.LENGTH_SHORT).show()
            return
        }

        prefs.edit()
            .putInt("schedule_start_hour", startHour)
            .putInt("schedule_start_minute", startMinute)
            .putInt("schedule_end_hour", endHour)
            .putInt("schedule_end_minute", endMinute)
            .apply()

        // Schedule worker immediately with new times
        BootCompletedReceiver.scheduleWidgetUpdateWorker(this)

        // Return result to widget manager
        val resultValue = Intent()
        resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        setResult(RESULT_OK, resultValue)
        finish()
    }
}