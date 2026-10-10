package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.Index
import com.example.data.model.CategoryBudget

@Entity(
    tableName = "budgets",
    primaryKeys = ["userId", "categoryId"],
    indices = [Index(value = ["userId"])]
)
data class BudgetEntity(
    val userId: String,
    val categoryId: String,
    val monthlyCap: Double
) {
    fun toDomain(): CategoryBudget = CategoryBudget(
        userId = userId,
        categoryId = categoryId,
        monthlyCap = monthlyCap
    )

    companion object {
        fun fromDomain(budget: CategoryBudget): BudgetEntity = BudgetEntity(
            userId = budget.userId,
            categoryId = budget.categoryId,
            monthlyCap = budget.monthlyCap
        )
    }
}
