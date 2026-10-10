package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.data.model.User

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val uid: String,
    val name: String,
    val email: String,
    val avatarUrl: String?,
    val provider: String,
    val lastActiveAt: Long
) {
    fun toDomain(): User = User(
        uid = uid,
        name = name,
        email = email,
        avatarUrl = avatarUrl,
        provider = provider,
        lastActiveAt = lastActiveAt
    )

    companion object {
        fun fromDomain(user: User): UserEntity = UserEntity(
            uid = user.uid,
            name = user.name,
            email = user.email,
            avatarUrl = user.avatarUrl,
            provider = user.provider,
            lastActiveAt = user.lastActiveAt
        )
    }
}
