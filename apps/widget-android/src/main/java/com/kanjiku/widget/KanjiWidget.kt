package com.kanjiku.widget

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.appwidget.SizeMode
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.padding
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import android.graphics.Color
import androidx.glance.layout.Spacer
import androidx.glance.layout.height
import androidx.glance.unit.dp
import androidx.glance.unit.sp
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import android.content.Intent
import android.net.Uri

/**
 * KanjiWidget — Glance AppWidget
 *
 * Displays a single kanji with readings and meaning.
 * Updated every 15 min via WorkManager (see WidgetUpdateWorker).
 *
 * Sizes: 2x2 (small), 4x2 (medium), 4x4 (large)
 */
class KanjiWidget : GlanceAppWidget() {

    override val sizeMode = SizeMode.Fixed
    override val sizes = setOf(
        SizeMode.Single,  // 2x2
        SizeMode.Single,  // 4x2
        SizeMode.Single   // 4x4
    )

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        // Read from SharedPreferences (populated by WidgetUpdateWorker)
        val prefs = context.getSharedPreferences("kanjiku_widget_prefs", Context.MODE_PRIVATE)
        val kanji = KanjiDisplayData(
            character = prefs.getString("current_kanji_character", "漢") ?: "漢",
            reading = prefs.getString("current_kanji_reading", "カン / から") ?: "カン / から",
            meaningId = prefs.getString("current_kanji_meaning", "Tiongkok / Suku Han") ?: "Tiongkok / Suku Han",
            jlptLevel = prefs.getInt("current_kanji_jlpt", 3)
        )

        val size = id.size
        val isSmall = size.widthDp < 300 // 2x2 ~ 150dp
        val isLarge = size.widthDp > 400 // 4x4 ~ 450dp

        provideContent {
            GlanceTheme {
                Box(
                    modifier = GlanceModifier
                        .fillMaxSize()
                        .background(ColorProvider(Color.parseColor("#FBF7EE")))
                        .clickable(actionStartActivity(
                            Intent(Intent.ACTION_VIEW, Uri.parse("kanjiku://kanji/${kanji.character}"))
                        )),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        modifier = GlanceModifier.padding(if (isSmall) 8.dp else if (isLarge) 24.dp else 16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Kanji character - size varies by widget size
                        Text(
                            text = kanji.character,
                            style = TextStyle(
                                fontSize = if (isSmall) 48.sp else if (isLarge) 96.sp else 64.sp,
                                fontWeight = FontWeight.Bold,
                                color = ColorProvider(Color.parseColor("#2D2D2D"))
                            )
                        )

                        Spacer(modifier = GlanceModifier.height(if (isSmall) 4.dp else if (isLarge) 8.dp else 6.dp))

                        // Reading (on'yomi / kun'yomi) - hide on small widget
                        if (!isSmall) {
                            Text(
                                text = kanji.reading,
                                style = TextStyle(
                                    fontSize = if (isLarge) 20.sp else 14.sp,
                                    color = ColorProvider(Color.parseColor("#666666"))
                                )
                            )

                            Spacer(modifier = GlanceModifier.height(if (isLarge) 4.dp else 2.dp))
                        }

                        // Meaning (Indonesian) - show on all sizes, truncated on small
                        Text(
                            text = if (isSmall) truncate(kanji.meaningId, 20) else kanji.meaningId,
                            style = TextStyle(
                                fontSize = if (isSmall) 10.sp else if (isLarge) 18.sp else 14.sp,
                                color = ColorProvider(Color.parseColor("#D8452B"))
                            )
                        )

                        // JLPT badge - only on large widget
                        if (isLarge) {
                            Spacer(modifier = GlanceModifier.height(8.dp))
                            Text(
                                text = "N${kanji.jlptLevel}",
                                style = TextStyle(
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ColorProvider(Color.parseColor("#888888"))
                                )
                            )
                        }
                    }
                }
            }
        }
    }

    private fun truncate(text: String, maxLen: Int): String {
        return if (text.length <= maxLen) text else "${text.substring(0, maxLen)}…"
    }
}

/**
 * Receiver registered in AndroidManifest.xml
 */
class KanjiWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = KanjiWidget()
}

/**
 * Data class for widget display.
 * Populated from SQLite queue built by the React Native app.
 */
data class KanjiDisplayData(
    val character: String,
    val reading: String,
    val meaningId: String,
    val jlptLevel: Int
) {
    companion object {
        fun placeholder() = KanjiDisplayData(
            character = "漢",
            reading = "カン / から",
            meaningId = "Tiongkok / Suku Han",
            jlptLevel = 3
        )
    }
}