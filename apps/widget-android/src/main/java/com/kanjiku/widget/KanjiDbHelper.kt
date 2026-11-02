package com.kanjiku.widget

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteException
import android.database.sqlite.SQLiteOpenHelper
import android.util.Log
import java.io.File

/**
 * Database helper for widget to read kanjiku.db from shared external storage.
 *
 * The React Native app copies kanjiku.db to:
 *   `/storage/emulated/0/Android/data/com.kanjiku/files/databases/kanjiku.db`
 * This file is readable by the widget because both apps share the same package name.
 *
 * If file not found or error, widget falls back to placeholder kanji.
 */
class KanjiDbHelper(context: Context) : SQLiteOpenHelper(
    context,
    getDatabasePath(context)?.absolutePath ?: "placeholder.db",
    null,
    1
) {
    override fun onCreate(db: SQLiteDatabase?) {
        // Database created by mobile app, not here
    }

    override fun onUpgrade(db: SQLiteDatabase?, oldVersion: Int, newVersion: Int) {
        // No migrations needed for widget (read-only)
    }

    override fun getReadableDatabase(): SQLiteDatabase {
        return try {
            super.getReadableDatabase()
        } catch (e: SQLiteException) {
            Log.e(TAG, "Failed to open database: ${e.message}", e)
            // Return in-memory fallback database
            SQLiteDatabase.create(null)
        }
    }

    companion object {
        private const val TAG = "KanjiDbHelper"
        private const val DB_NAME = "kanjiku.db"
        private const val DB_SUBDIR = "databases"

        /**
         * Returns the path to the shared kanjiku.db in external storage.
         * Returns null if file does not exist or external storage not available.
         */
        fun getDatabasePath(context: Context): File? {
            return try {
                val externalFilesDir = context.getExternalFilesDir(null)
                if (externalFilesDir == null) {
                    Log.w(TAG, "External files dir unavailable")
                    return null
                }

                val dbDir = File(externalFilesDir, DB_SUBDIR)
                val dbFile = File(dbDir, DB_NAME)

                if (dbFile.exists()) {
                    dbFile
                } else {
                    Log.w(TAG, "Database file not found at ${dbFile.absolutePath}")
                    null
                }
            } catch (e: SecurityException) {
                Log.e(TAG, "Security exception accessing external storage", e)
                null
            }
        }

        /**
         * Checks if database is available and can be read.
         */
        fun isDatabaseAvailable(context: Context): Boolean {
            return getDatabasePath(context)?.let { it.exists() && it.canRead() } == true
        }
    }
}