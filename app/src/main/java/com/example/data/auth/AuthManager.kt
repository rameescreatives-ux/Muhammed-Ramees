package com.example.data.auth

import android.content.Context
import android.content.SharedPreferences
import com.example.data.local.ShadowXDatabase
import com.example.data.local.entity.UserEntity
import com.example.data.model.User
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import java.security.SecureRandom
import java.util.UUID

data class PendingOtpSession(
    val email: String,
    val name: String,
    val provider: String,
    val code: String,
    val expiresAt: Long,
    val isExistingAccount: Boolean = false,
    val existingUid: String? = null
)

class AuthManager(
    private val context: Context,
    private val database: ShadowXDatabase
) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("shadowx_auth_prefs", Context.MODE_PRIVATE)

    private val _activeUserId = MutableStateFlow<String?>(prefs.getString(KEY_ACTIVE_USER_ID, null))
    val activeUserId: StateFlow<String?> = _activeUserId.asStateFlow()

    private val _pendingOtp = MutableStateFlow<PendingOtpSession?>(null)
    val pendingOtp: StateFlow<PendingOtpSession?> = _pendingOtp.asStateFlow()

    private val secureRandom = SecureRandom()
    private val scope = CoroutineScope(Dispatchers.IO)

    companion object {
        private const val KEY_ACTIVE_USER_ID = "active_user_id"
        private const val OTP_VALIDITY_MILLIS = 10 * 60 * 1000L // 10 minutes
    }

    val savedUsers: Flow<List<User>> = database.userDao().getAllUsers().map { list ->
        list.map { it.toDomain() }
    }

    suspend fun getActiveUser(): User? {
        val uid = _activeUserId.value ?: return null
        return database.userDao().getUserByIdOnce(uid)?.toDomain()
    }

    /**
     * Initiates login or sign-up flow by sending a 6-digit OTP code to the verified email.
     */
    fun startOtpFlow(
        email: String,
        name: String,
        provider: String = "google",
        existingUid: String? = null
    ): String {
        val code = generate6DigitCode()
        val expiresAt = System.currentTimeMillis() + OTP_VALIDITY_MILLIS
        val isExisting = existingUid != null

        _pendingOtp.value = PendingOtpSession(
            email = email.trim(),
            name = name.trim().ifEmpty { email.substringBefore("@").replaceFirstChar { it.uppercase() } },
            provider = provider,
            code = code,
            expiresAt = expiresAt,
            isExistingAccount = isExisting,
            existingUid = existingUid
        )

        return code
    }

    fun resendOtp(): String? {
        val current = _pendingOtp.value ?: return null
        val newCode = generate6DigitCode()
        _pendingOtp.value = current.copy(
            code = newCode,
            expiresAt = System.currentTimeMillis() + OTP_VALIDITY_MILLIS
        )
        return newCode
    }

    fun cancelOtp() {
        _pendingOtp.value = null
    }

    suspend fun verifyOtp(enteredCode: String): Result<User> {
        val current = _pendingOtp.value
            ?: return Result.failure(IllegalStateException("No OTP verification session in progress."))

        if (System.currentTimeMillis() > current.expiresAt) {
            return Result.failure(IllegalStateException("Verification code has expired. Please tap Resend."))
        }

        if (enteredCode.trim() != current.code) {
            return Result.failure(IllegalArgumentException("Incorrect 6-digit code. Please verify and try again."))
        }

        // OTP verified successfully!
        val uid = current.existingUid ?: generateUidForEmail(current.email)

        // Check if user exists in database, or create new private workspace
        val existing = database.userDao().getUserByIdOnce(uid)
        val finalUser = if (existing != null) {
            val updated = existing.copy(lastActiveAt = System.currentTimeMillis())
            database.userDao().insertUser(updated)
            updated.toDomain()
        } else {
            // New user starts with zero balance, zero transactions, zero budgets
            val newUser = User(
                uid = uid,
                name = current.name,
                email = current.email,
                avatarUrl = null,
                provider = current.provider,
                lastActiveAt = System.currentTimeMillis()
            )
            database.userDao().insertUser(UserEntity.fromDomain(newUser))
            newUser
        }

        // Set active user session
        prefs.edit().putString(KEY_ACTIVE_USER_ID, uid).apply()
        _activeUserId.value = uid
        _pendingOtp.value = null

        return Result.success(finalUser)
    }

    fun logout() {
        prefs.edit().remove(KEY_ACTIVE_USER_ID).apply()
        _activeUserId.value = null
        _pendingOtp.value = null
    }

    suspend fun updateUserAvatar(avatarUrl: String?) {
        val uid = _activeUserId.value ?: return
        database.userDao().updateAvatar(uid, avatarUrl)
    }

    private fun generate6DigitCode(): String {
        val number = 100000 + secureRandom.nextInt(900000)
        return number.toString()
    }

    private fun generateUidForEmail(email: String): String {
        return "sx_user_" + UUID.nameUUIDFromBytes(email.lowercase().toByteArray()).toString().take(12)
    }
}
