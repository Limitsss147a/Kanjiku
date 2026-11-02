package com.kanjiku.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.glance.GlanceComposable
import androidx.glance.GlanceModifier
import androidx.glance.background
import androidx.glance.layout.Column
import androidx.glance.layout.fillMaxWidth
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import androidx.glance.appwidget.cornerRadius
import androidx.glance.layout.padding
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Theme system untuk widget: Washi (light) + Sumi (dark)
 * Sumi: dark background (#2C2C2C), light text (#F5F5F5)
 * Washi: light background (#F9F7F4), dark text (#3C3C3C)
 */
object WidgetTheme {
    // Washi (light) theme
    object Washi {
        val background = Color(0xFFF9F7F4)
        val surface = Color(0xFFFEFCFA)
        val text = Color(0xFF3C3C3C)
        val textSecondary = Color(0xFF7C7C7C)
        val accent = Color(0xFFD4845C) // Washi accent: warm ochre
        val jlptBadge = mapOf(
            "N5" to Color(0xFF4CAF50), // green
            "N4" to Color(0xFF2196F3), // blue
            "N3" to Color(0xFFFF9800)  // orange
        )
    }

    // Sumi (dark) theme
    object Sumi {
        val background = Color(0xFF2C2C2C)
        val surface = Color(0xFF1A1A1A)
        val text = Color(0xFFF5F5F5)
        val textSecondary = Color(0xFFB0B0B0)
        val accent = Color(0xFFE8B4A1) // Sumi accent: pale peach
        val jlptBadge = mapOf(
            "N5" to Color(0xFF66BB6A), // light green
            "N4" to Color(0xFF42A5F5), // light blue
            "N3" to Color(0xFFFFB74D)  // light orange
        )
    }

    /**
     * Get theme based on system preference or user config.
     * For now: check isDarkMode flag in SharedPreferences
     */
    fun getCurrentTheme(context: Context): Theme {
        val prefs = context.getSharedPreferences("kanjiku_widget_prefs", Context.MODE_PRIVATE)
        val isDark = prefs.getBoolean("theme_dark", false)
        return if (isDark) Sumi else Washi
    }
}

interface Theme {
    val background: Color
    val surface: Color
    val text: Color
    val textSecondary: Color
    val accent: Color
    val jlptBadge: Map<String, Color>
}

/**
 * Wrapper to make WidgetTheme.Washi/Sumi implement Theme interface
 */
class WashiTheme : Theme {
    override val background = WidgetTheme.Washi.background
    override val surface = WidgetTheme.Washi.surface
    override val text = WidgetTheme.Washi.text
    override val textSecondary = WidgetTheme.Washi.textSecondary
    override val accent = WidgetTheme.Washi.accent
    override val jlptBadge = WidgetTheme.Washi.jlptBadge
}

class SumiTheme : Theme {
    override val background = WidgetTheme.Sumi.background
    override val surface = WidgetTheme.Sumi.surface
    override val text = WidgetTheme.Sumi.text
    override val textSecondary = WidgetTheme.Sumi.textSecondary
    override val accent = WidgetTheme.Sumi.accent
    override val jlptBadge = WidgetTheme.Sumi.jlptBadge
}
