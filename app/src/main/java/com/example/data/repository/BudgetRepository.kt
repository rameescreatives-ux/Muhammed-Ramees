package com.example.data.repository

import com.example.data.local.ShadowXDatabase
import com.example.data.local.entity.BudgetEntity
import com.example.data.local.entity.TransactionEntity
import com.example.data.model.CategoryBudget
import com.example.data.model.Transaction
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class BudgetRepository(
    private val database: ShadowXDatabase
) {
    fun getTransactions(userId: String): Flow<List<Transaction>> {
        return database.transactionDao().getTransactionsForUser(userId).map { list ->
            list.map { it.toDomain() }
        }
    }

    suspend fun addTransaction(transaction: Transaction) {
        database.transactionDao().insertTransaction(TransactionEntity.fromDomain(transaction))
    }

    suspend fun deleteTransaction(id: String, userId: String) {
        database.transactionDao().deleteTransaction(id, userId)
    }

    fun getBudgets(userId: String): Flow<List<CategoryBudget>> {
        return database.budgetDao().getBudgetsForUser(userId).map { list ->
            list.map { it.toDomain() }
        }
    }

    suspend fun setCategoryBudget(budget: CategoryBudget) {
        database.budgetDao().setBudget(BudgetEntity.fromDomain(budget))
    }

    suspend fun removeCategoryBudget(userId: String, categoryId: String) {
        database.budgetDao().deleteBudget(userId, categoryId)
    }
}
