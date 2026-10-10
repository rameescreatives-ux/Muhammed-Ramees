package com.example

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.example.data.auth.EmailValidator
import com.example.data.local.ShadowXDatabase
import com.example.data.local.entity.BudgetEntity
import com.example.data.local.entity.TransactionEntity
import com.example.data.local.entity.UserEntity
import com.example.data.model.TransactionType
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

    private lateinit var db: ShadowXDatabase

    @Before
    fun setup() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        db = Room.inMemoryDatabaseBuilder(context, ShadowXDatabase::class.java)
            .allowMainThreadQueries()
            .build()
    }

    @After
    fun tearDown() {
        db.close()
    }

    @Test
    fun `app name matches ShadowX Budget`() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val appName = context.getString(R.string.app_name)
        assertEquals("ShadowX Budget", appName)
    }

    @Test
    fun `email validator detects disposable domains and typos`() {
        // Disposable domain blocked
        val disposableResult = EmailValidator.validate("testuser@mailinator.com", "testuser@mailinator.com")
        assertTrue(disposableResult is EmailValidator.ValidationResult.DisposableDomain)

        // Placeholder username blocked
        val placeholderResult = EmailValidator.validate("test@shadowxstudio.ae", "test@shadowxstudio.ae")
        assertTrue(placeholderResult is EmailValidator.ValidationResult.PlaceholderLocalPart)

        // Typo correction detects gmai.com -> gmail.com
        val suggestion = EmailValidator.checkTypoSuggestion("razal@gmai.com")
        assertEquals("razal@gmail.com", suggestion)

        // Valid email passes
        val validResult = EmailValidator.validate("razal@shadowxstudio.ae", "razal@shadowxstudio.ae")
        assertTrue(validResult is EmailValidator.ValidationResult.Valid)
    }

    @Test
    fun `per-account data isolation guarantees zero cross-leakage`() = runBlocking {
        val userA = UserEntity(
            uid = "user_a",
            name = "User Alpha",
            email = "alpha@shadowxstudio.ae",
            avatarUrl = null,
            provider = "google",
            lastActiveAt = System.currentTimeMillis()
        )
        val userB = UserEntity(
            uid = "user_b",
            name = "User Beta",
            email = "beta@shadowxstudio.ae",
            avatarUrl = null,
            provider = "apple",
            lastActiveAt = System.currentTimeMillis()
        )

        db.userDao().insertUser(userA)
        db.userDao().insertUser(userB)

        // User A adds transactions and budgets
        db.transactionDao().insertTransaction(
            TransactionEntity(
                id = "tx_1",
                userId = "user_a",
                type = "income",
                categoryId = "salary",
                amount = 15000.0,
                dateMillis = System.currentTimeMillis(),
                note = "Monthly salary",
                createdAt = System.currentTimeMillis()
            )
        )
        db.budgetDao().setBudget(
            BudgetEntity(userId = "user_a", categoryId = "groceries", monthlyCap = 3000.0)
        )

        // Verify User A has 1 transaction and 1 budget
        val txA = db.transactionDao().getTransactionsForUser("user_a").first()
        val budgetA = db.budgetDao().getBudgetsForUser("user_a").first()
        assertEquals(1, txA.size)
        assertEquals(1, budgetA.size)

        // Verify User B (fresh workspace) has strictly ZERO transactions and ZERO budgets
        val txB = db.transactionDao().getTransactionsForUser("user_b").first()
        val budgetB = db.budgetDao().getBudgetsForUser("user_b").first()
        assertEquals(0, txB.size)
        assertEquals(0, budgetB.size)
    }
}
