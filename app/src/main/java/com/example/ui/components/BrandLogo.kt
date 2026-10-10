package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.FrauncesFontFamily
import com.example.ui.theme.ShadowXGold
import com.example.ui.theme.ShadowXNavy
import com.example.ui.theme.ShadowXNavyDark
import com.example.ui.theme.ShadowXNavyLight
import com.example.ui.theme.ShadowXTeal

@Composable
fun BrandLogo(
    size: Dp = 64.dp,
    modifier: Modifier = Modifier
) {
    val cornerRadius = size * 0.28f
    val fontSize = (size.value * 0.44f).sp

    Box(
        modifier = modifier
            .size(size)
            .clip(RoundedCornerShape(cornerRadius))
            .background(
                Brush.linearGradient(
                    listOf(ShadowXNavyLight, ShadowXNavyDark)
                )
            )
            .border(
                width = (size.value * 0.035f).coerceAtLeast(1.5f).dp,
                color = ShadowXGold,
                shape = RoundedCornerShape(cornerRadius)
            ),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "S",
                fontFamily = FrauncesFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = fontSize,
                color = ShadowXGold,
                lineHeight = fontSize
            )
            Text(
                text = "X",
                fontFamily = FrauncesFontFamily,
                fontWeight = FontWeight.Bold,
                fontSize = fontSize,
                color = ShadowXTeal,
                lineHeight = fontSize
            )
        }
    }
}
