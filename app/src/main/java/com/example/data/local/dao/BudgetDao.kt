package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.data.local.entity.BudgetEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface BudgetDao {
    @Query("SELECT * FROM budgets WHERE userId = :userId")
    fun getBudgetsForUser(userId: String): Flow<List<BudgetEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun setBudget(budget: BudgetEntity)

    @Query("DELETE FROM budgets WHERE userId = :userId AND categoryId = :categoryId")
    suspend fun deleteBudget(userId: String, categoryId: String)

    @Query("DELETE FROM budgets WHERE userId = :userId")
    suspend fun deleteAllBudgetsForUser(userId: String)
}
