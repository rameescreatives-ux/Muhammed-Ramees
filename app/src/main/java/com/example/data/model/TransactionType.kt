package com.example.data.model

enum class TransactionType(val rawValue: String) {
    EXPENSE("expense"),
    INCOME("income");

    companion object {
        fun fromString(value: String): TransactionType {
            return if (value.equals("income", ignoreCase = true)) INCOME else EXPENSE
        }
    }
}
