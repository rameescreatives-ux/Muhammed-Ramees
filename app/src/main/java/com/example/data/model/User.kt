package com.example.data.model

data class User(
    val uid: String,
    val name: String,
    val email: String,
    val avatarUrl: String? = null,
    val provider: String = "google",
    val lastActiveAt: Long = System.currentTimeMillis()
)
