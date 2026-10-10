package com.example.data.model

import androidx.compose.ui.graphics.Color
import com.example.ui.theme.ShadowXGold
import com.example.ui.theme.ShadowXGreen
import com.example.ui.theme.ShadowXNavy
import com.example.ui.theme.ShadowXOrange
import com.example.ui.theme.ShadowXRed
import com.example.ui.theme.ShadowXTeal
import com.example.ui.theme.ShadowXTealBright

data class Category(
    val id: String,
    val name: String,
    val iconEmoji: String,
    val type: TransactionType,
    val color: Color
) {
    companion object {
        val EXPENSE_CATEGORIES = listOf(
            Category("groceries", "Groceries", "🛒", TransactionType.EXPENSE, ShadowXOrange),
            Category("car", "Car", "🚗", TransactionType.EXPENSE, ShadowXTeal),
            Category("housing", "Housing", "🏠", TransactionType.EXPENSE, ShadowXNavy),
            Category("utilities", "Utilities", "💡", TransactionType.EXPENSE, ShadowXGold),
            Category("clothes", "Clothes", "👕", TransactionType.EXPENSE, ShadowXRed),
            Category("dining", "Dining", "🍽️", TransactionType.EXPENSE, ShadowXTealBright),
            Category("health", "Health", "⚕️", TransactionType.EXPENSE, ShadowXGreen),
            Category("other_expense", "Other", "📦", TransactionType.EXPENSE, Color(0xFF5A6E85))
        )

        val INCOME_CATEGORIES = listOf(
            Category("salary", "Salary", "💼", TransactionType.INCOME, ShadowXGreen),
            Category("project", "Project", "🎯", TransactionType.INCOME, ShadowXTeal),
            Category("freelance", "Freelance", "🧩", TransactionType.INCOME, ShadowXGold),
            Category("other_income", "Other", "➕", TransactionType.INCOME, ShadowXOrange)
        )

        val ALL_CATEGORIES = EXPENSE_CATEGORIES + INCOME_CATEGORIES

        fun findById(id: String): Category {
            return ALL_CATEGORIES.firstOrNull { it.id == id }
                ?: Category(id, id.replaceFirstChar { it.uppercase() }, "📦", TransactionType.EXPENSE, Color(0xFF5A6E85))
        }
    }
}
