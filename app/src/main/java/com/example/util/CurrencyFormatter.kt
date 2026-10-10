package com.example.util

import java.text.NumberFormat
import java.util.Locale

object CurrencyFormatter {
    private val formatter: NumberFormat = NumberFormat.getNumberInstance(Locale.US).apply {
        maximumFractionDigits = 0
        minimumFractionDigits = 0
    }

    fun format(amount: Double): String {
        return "AED " + formatter.format(amount)
    }

    fun formatSigned(amount: Double, isIncome: Boolean): String {
        val sign = if (isIncome) "+" else "-"
        return "$sign AED " + formatter.format(amount)
    }

    fun formatNumberOnly(amount: Double): String {
        return formatter.format(amount)
    }
}
