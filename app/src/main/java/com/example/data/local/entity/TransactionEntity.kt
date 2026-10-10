package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.data.model.Transaction
import com.example.data.model.TransactionType

@Entity(
    tableName = "transactions",
    indices = [Index(value = ["userId"])]
)
data class TransactionEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val type: String,
    val categoryId: String,
    val amount: Double,
    val dateMillis: Long,
    val note: String,
    val createdAt: Long
) {
    fun toDomain(): Transaction = Transaction(
        id = id,
        userId = userId,
        type = TransactionType.fromString(type),
        categoryId = categoryId,
        amount = amount,
        dateMillis = dateMillis,
        note = note,
        createdAt = createdAt
    )

    companion object {
        fun fromDomain(transaction: Transaction): TransactionEntity = TransactionEntity(
            id = transaction.id,
            userId = transaction.userId,
            type = transaction.type.rawValue,
            categoryId = transaction.categoryId,
            amount = transaction.amount,
            dateMillis = transaction.dateMillis,
            note = transaction.note,
            createdAt = transaction.createdAt
        )
    }
}
