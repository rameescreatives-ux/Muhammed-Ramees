package com.example.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.TrendingDown
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Fill
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.FrauncesFontFamily
import com.example.ui.theme.ShadowXGold
import com.example.ui.theme.ShadowXGreen
import com.example.ui.theme.ShadowXNavy
import com.example.ui.theme.ShadowXNavyDark
import com.example.ui.theme.ShadowXOrange
import com.example.ui.theme.ShadowXRed
import com.example.ui.theme.ShadowXTeal
import com.example.ui.viewmodel.AnalyticsPeriod
import com.example.ui.viewmodel.CategoryExpenseSummary
import com.example.ui.viewmodel.PeriodData
import com.example.util.CurrencyFormatter
import kotlin.math.max

@Composable
fun AnalyticsScreen(
    period: AnalyticsPeriod,
    periodsData: List<PeriodData>,
    breakdown: List<CategoryExpenseSummary>,
    onSelectPeriod: (AnalyticsPeriod) -> Unit,
    modifier: Modifier = Modifier
) {
    val totalExpenseInBreakdown = breakdown.sumOf { it.amount }

    // Trend badge calculation: compare current period (last element) to previous period
    val currentPeriod = periodsData.lastOrNull()
    val prevPeriod = periodsData.getOrNull(periodsData.size - 2)

    val currentExpense = currentPeriod?.expense ?: 0.0
    val prevExpense = prevPeriod?.expense ?: 0.0
    val trendPercent = if (prevExpense > 0) {
        (((currentExpense - prevExpense) / prevExpense) * 100).toInt()
    } else 0
    val isExpenseIncreased = trendPercent > 0

    Column(
        modifier = modifier
            .fillMaxSize()
            .statusBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp)
            .padding(bottom = 96.dp)
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Spending Analytics",
                    fontFamily = FrauncesFontFamily,
                    fontWeight = FontWeight.Bold,
                    fontSize = 28.sp,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Income and expense tracking over time",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Monthly / Weekly Toggle Switch
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(46.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant)
                .padding(4.dp)
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(9.dp))
                    .background(if (period == AnalyticsPeriod.MONTHLY) ShadowXNavy else Color.Transparent)
                    .clickable { onSelectPeriod(AnalyticsPeriod.MONTHLY) }
                    .testTag("toggle_monthly"),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Monthly View",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = if (period == AnalyticsPeriod.MONTHLY) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(9.dp))
                    .background(if (period == AnalyticsPeriod.WEEKLY) ShadowXNavy else Color.Transparent)
                    .clickable { onSelectPeriod(AnalyticsPeriod.WEEKLY) }
                    .testTag("toggle_weekly"),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Weekly View",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = if (period == AnalyticsPeriod.WEEKLY) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Line / Area Chart Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("analytics_line_chart_card"),
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            ),
            border = CardDefaults.outlinedCardBorder()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Cash Flow (Income vs Expense)",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Last 6 periods comparison in AED",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Trend badge
                    if (trendPercent != 0) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isExpenseIncreased) ShadowXRed.copy(alpha = 0.15f) else ShadowXGreen.copy(alpha = 0.15f))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = if (isExpenseIncreased) Icons.Default.TrendingUp else Icons.Default.TrendingDown,
                                    contentDescription = null,
                                    tint = if (isExpenseIncreased) ShadowXRed else ShadowXGreen,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "${if (trendPercent > 0) "+" else ""}$trendPercent% vs last",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isExpenseIncreased) ShadowXRed else ShadowXGreen
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Chart Legend
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(ShadowXGreen))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "Income", style = MaterialTheme.typography.labelSmall)

                    Spacer(modifier = Modifier.width(16.dp))

                    Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(ShadowXRed))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(text = "Expenses", style = MaterialTheme.typography.labelSmall)
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Canvas Area Chart
                LineAreaChartCanvas(
                    data = periodsData,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Period Labels Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    periodsData.forEach { p ->
                        Text(
                            text = p.label,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Donut Chart Card (Expense Breakdown by Category)
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("analytics_donut_chart_card"),
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            ),
            border = CardDefaults.outlinedCardBorder()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(
                    text = "Expense Breakdown",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Category distribution for this account",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(20.dp))

                if (breakdown.isEmpty() || totalExpenseInBreakdown <= 0.0) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = "⭕", fontSize = 32.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "No expenses recorded to analyze yet.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                } else {
                    // Donut Chart with center total
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(210.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        DonutChartCanvas(
                            breakdown = breakdown,
                            modifier = Modifier.size(200.dp)
                        )

                        // Center Circle Content
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "TOTAL",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = CurrencyFormatter.format(totalExpenseInBreakdown),
                                fontFamily = FrauncesFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Legend items
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        breakdown.forEach { item ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(12.dp)
                                            .clip(CircleShape)
                                            .background(item.category.color)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(text = item.category.iconEmoji, fontSize = 14.sp)
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = item.category.name,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.Medium,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                }

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "${item.percentage.toInt()}%",
                                        style = MaterialTheme.typography.bodySmall,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = CurrencyFormatter.format(item.amount),
                                        fontFamily = FrauncesFontFamily,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LineAreaChartCanvas(
    data: List<PeriodData>,
    modifier: Modifier = Modifier
) {
    val outlineColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
    val maxVal = max(
        100.0,
        max(
            data.maxOfOrNull { it.income } ?: 100.0,
            data.maxOfOrNull { it.expense } ?: 100.0
        )
    )

    Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height
        val stepX = if (data.size > 1) width / (data.size - 1) else width

        // Draw horizontal grid lines
        val gridLines = 4
        for (i in 0..gridLines) {
            val y = height * (i.toFloat() / gridLines)
            drawLine(
                color = outlineColor,
                start = Offset(0f, y),
                end = Offset(width, y),
                strokeWidth = 1.dp.toPx()
            )
        }

        if (data.isEmpty()) return@Canvas

        // Build Paths for Income (Green)
        val incomePath = Path()
        val incomeAreaPath = Path()

        val expensePath = Path()
        val expenseAreaPath = Path()

        data.forEachIndexed { i, p ->
            val x = i * stepX
            val yIncome = height - (p.income.toFloat() / maxVal.toFloat() * (height - 20.dp.toPx())) - 10.dp.toPx()
            val yExpense = height - (p.expense.toFloat() / maxVal.toFloat() * (height - 20.dp.toPx())) - 10.dp.toPx()

            if (i == 0) {
                incomePath.moveTo(x, yIncome)
                incomeAreaPath.moveTo(x, height)
                incomeAreaPath.lineTo(x, yIncome)

                expensePath.moveTo(x, yExpense)
                expenseAreaPath.moveTo(x, height)
                expenseAreaPath.lineTo(x, yExpense)
            } else {
                incomePath.lineTo(x, yIncome)
                incomeAreaPath.lineTo(x, yIncome)

                expensePath.lineTo(x, yExpense)
                expenseAreaPath.lineTo(x, yExpense)
            }
        }

        // Close Area Paths
        val lastX = (data.size - 1) * stepX
        incomeAreaPath.lineTo(lastX, height)
        incomeAreaPath.close()

        expenseAreaPath.lineTo(lastX, height)
        expenseAreaPath.close()

        // Draw Income Gradient Area
        drawPath(
            path = incomeAreaPath,
            brush = Brush.verticalGradient(
                colors = listOf(ShadowXGreen.copy(alpha = 0.25f), Color.Transparent)
            )
        )

        // Draw Expense Gradient Area
        drawPath(
            path = expenseAreaPath,
            brush = Brush.verticalGradient(
                colors = listOf(ShadowXRed.copy(alpha = 0.25f), Color.Transparent)
            )
        )

        // Draw Income Line & Points
        drawPath(
            path = incomePath,
            color = ShadowXGreen,
            style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round)
        )

        // Draw Expense Line & Points
        drawPath(
            path = expensePath,
            color = ShadowXRed,
            style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round)
        )

        // Draw point dots
        data.forEachIndexed { i, p ->
            val x = i * stepX
            val yIncome = height - (p.income.toFloat() / maxVal.toFloat() * (height - 20.dp.toPx())) - 10.dp.toPx()
            val yExpense = height - (p.expense.toFloat() / maxVal.toFloat() * (height - 20.dp.toPx())) - 10.dp.toPx()

            drawCircle(color = ShadowXGreen, radius = 4.dp.toPx(), center = Offset(x, yIncome))
            drawCircle(color = ShadowXRed, radius = 4.dp.toPx(), center = Offset(x, yExpense))
        }
    }
}

@Composable
fun DonutChartCanvas(
    breakdown: List<CategoryExpenseSummary>,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier) {
        val total = breakdown.sumOf { it.amount }.toFloat()
        if (total <= 0f) return@Canvas

        var startAngle = -90f
        val strokeWidth = 32.dp.toPx()
        val diameter = size.minDimension - strokeWidth
        val topLeft = Offset(
            (size.width - diameter) / 2f,
            (size.height - diameter) / 2f
        )
        val arcSize = Size(diameter, diameter)

        breakdown.forEach { item ->
            val sweepAngle = (item.amount.toFloat() / total) * 360f
            drawArc(
                color = item.category.color,
                startAngle = startAngle,
                sweepAngle = sweepAngle,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(width = strokeWidth, cap = StrokeCap.Butt)
            )
            startAngle += sweepAngle
        }
    }
}
