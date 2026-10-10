package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = ShadowXTealBright,
    onPrimary = ShadowXNavyDark,
    primaryContainer = ShadowXNavyCard,
    onPrimaryContainer = ShadowXTealBright,
    secondary = ShadowXGold,
    onSecondary = ShadowXNavyDark,
    secondaryContainer = ShadowXNavyCard,
    onSecondaryContainer = ShadowXGold,
    tertiary = ShadowXOrange,
    onTertiary = Color.White,
    background = ShadowXBgDark,
    onBackground = ShadowXTextPrimaryDark,
    surface = ShadowXSurfaceDark,
    onSurface = ShadowXTextPrimaryDark,
    surfaceVariant = ShadowXNavyCard,
    onSurfaceVariant = ShadowXTextSecondaryDark,
    outline = ShadowXBorderDark,
    error = ShadowXRed,
    onError = Color.White
)

private val LightColorScheme = lightColorScheme(
    primary = ShadowXNavy,
    onPrimary = Color.White,
    primaryContainer = ShadowXNavyLight,
    onPrimaryContainer = Color.White,
    secondary = ShadowXTeal,
    onSecondary = Color.White,
    secondaryContainer = ShadowXTealLight,
    onSecondaryContainer = ShadowXTeal,
    tertiary = ShadowXOrange,
    onTertiary = Color.White,
    background = ShadowXBgLight,
    onBackground = ShadowXTextPrimaryLight,
    surface = ShadowXSurfaceLight,
    onSurface = ShadowXTextPrimaryLight,
    surfaceVariant = Color(0xFFEDF1F0),
    onSurfaceVariant = ShadowXTextSecondaryLight,
    outline = ShadowXBorderLight,
    error = ShadowXRed,
    onError = Color.White
)

@Composable
fun ShadowXTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
