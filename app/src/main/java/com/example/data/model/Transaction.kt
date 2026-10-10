package com.example.data.model

import java.util.UUID

data class Transaction(
    val id: String = UUID.randomUUID().toString(),
    val userId: String,
    val type: TransactionType,
    val categoryId: String,
    val amount: Double,
    val dateMillis: Long = System.currentTimeMillis(),
    val note: String = "",
    val createdAt: Long = System.currentTimeMillis()
)
