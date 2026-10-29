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

/**
 * KanjiWidget — Glance AppWidget
 *
 * Displays a single kanji with readings and meaning.
 * Updated every 15 min via WorkManager (see WidgetUpdateWorker).
 *
 * Sizes: 2x2 (small), 4x2 (medium), 4x4 (large)
 */
class KanjiWidget : GlanceAppWidget() {

    override val sizeMode = SizeMode.Single

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        // TODO: Read from queue DB via FileProvider
        val kanji = KanjiDisplayData.placeholder()

        provideContent {
            GlanceTheme {
                Box(
                    modifier = GlanceModifier
                        .fillMaxSize()
                        .background(ColorProvider(Color.parseColor("#FBF7EE"))),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        modifier = GlanceModifier.padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Kanji character
                        Text(
                            text = kanji.character,
                            style = TextStyle(
                                fontSize = 48.sp,
                                fontWeight = FontWeight.Bold,
                                color = ColorProvider(Color.parseColor("#2D2D2D"))
                            )
                        )

                        Spacer(modifier = GlanceModifier.height(4.dp))

                        // Reading (on'yomi / kun'yomi)
                        Text(
                            text = kanji.reading,
                            style = TextStyle(
                                fontSize = 14.sp,
                                color = ColorProvider(Color.parseColor("#666666"))
                            )
                        )

                        Spacer(modifier = GlanceModifier.height(2.dp))

                        // Meaning (Indonesian)
                        Text(
                            text = kanji.meaningId,
                            style = TextStyle(
                                fontSize = 12.sp,
                                color = ColorProvider(Color.parseColor("#D8452B"))
                            )
                        )
                    }
                }
            }
        }
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