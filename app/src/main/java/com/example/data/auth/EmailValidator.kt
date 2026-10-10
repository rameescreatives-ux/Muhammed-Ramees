package com.example.data.auth

import kotlin.math.min

object EmailValidator {

    private val DISPOSABLE_DOMAINS = setOf(
        "mailinator.com",
        "yopmail.com",
        "tempmail.com",
        "example.com",
        "test.com",
        "10minutemail.com",
        "guerrillamail.com",
        "throwawaymail.com",
        "sharklasers.com",
        "dispostable.com",
        "fake.com",
        "trashmail.com",
        "getairmail.com"
    )

    private val PLACEHOLDER_LOCAL_PARTS = setOf(
        "test",
        "demo",
        "sample",
        "fake",
        "admin",
        "noreply",
        "no-reply",
        "user",
        "noone",
        "asdf"
    )

    private val COMMON_DOMAINS = listOf(
        "gmail.com",
        "yahoo.com",
        "outlook.com",
        "hotmail.com",
        "icloud.com"
    )

    private val EMAIL_REGEX = Regex("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$")

    sealed class ValidationResult {
        object Valid : ValidationResult()
        data class InvalidFormat(val message: String) : ValidationResult()
        data class DisposableDomain(val message: String) : ValidationResult()
        data class PlaceholderLocalPart(val message: String) : ValidationResult()
        data class MismatchedConfirmation(val message: String) : ValidationResult()
    }

    fun validate(email: String, confirmEmail: String? = null): ValidationResult {
        val trimmed = email.trim()
        if (trimmed.isEmpty()) {
            return ValidationResult.InvalidFormat("Email address cannot be empty.")
        }

        if (!EMAIL_REGEX.matches(trimmed)) {
            return ValidationResult.InvalidFormat("Please enter a valid email address (e.g. name@domain.com).")
        }

        val parts = trimmed.split("@")
        if (parts.size != 2) {
            return ValidationResult.InvalidFormat("Invalid email format.")
        }

        val localPart = parts[0].lowercase()
        val domain = parts[1].lowercase()

        if (PLACEHOLDER_LOCAL_PARTS.contains(localPart)) {
            return ValidationResult.PlaceholderLocalPart("Placeholder usernames ('$localPart') are not accepted for privacy security.")
        }

        if (DISPOSABLE_DOMAINS.contains(domain)) {
            return ValidationResult.DisposableDomain("Temporary or disposable email domains ($domain) are blocked.")
        }

        if (confirmEmail != null && trimmed.lowercase() != confirmEmail.trim().lowercase()) {
            return ValidationResult.MismatchedConfirmation("Email addresses do not match.")
        }

        return ValidationResult.Valid
    }

    /**
     * Checks if the domain might be a typo of a common provider.
     * Returns suggested email if distance <= 2, else null.
     */
    fun checkTypoSuggestion(email: String): String? {
        val trimmed = email.trim()
        val parts = trimmed.split("@")
        if (parts.size != 2) return null

        val localPart = parts[0]
        val domain = parts[1].lowercase()

        // If domain is already exact common domain, no typo
        if (COMMON_DOMAINS.contains(domain)) return null

        for (common in COMMON_DOMAINS) {
            val dist = levenshteinDistance(domain, common)
            if (dist in 1..2) {
                return "$localPart@$common"
            }
        }
        return null
    }

    private fun levenshteinDistance(s1: String, s2: String): Int {
        val dp = Array(s1.length + 1) { IntArray(s2.length + 1) }

        for (i in 0..s1.length) dp[i][0] = i
        for (j in 0..s2.length) dp[0][j] = j

        for (i in 1..s1.length) {
            for (j in 1..s2.length) {
                val cost = if (s1[i - 1] == s2[j - 1]) 0 else 1
                dp[i][j] = min(
                    dp[i - 1][j] + 1,
                    min(dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
                )
            }
        }
        return dp[s1.length][s2.length]
    }
}
