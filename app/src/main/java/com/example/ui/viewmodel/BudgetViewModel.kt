package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.auth.AuthManager
import com.example.data.auth.EmailValidator
import com.example.data.auth.PendingOtpSession
import com.example.data.local.ShadowXDatabase
import com.example.data.model.Category
import com.example.data.model.CategoryBudget
import com.example.data.model.Transaction
import com.example.data.model.TransactionType
import com.example.data.model.User
import com.example.data.repository.BudgetRepository
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

enum class BudgetTab {
    HOME,
    BUDGET,
    ANALYTICS,
    ACTIVITY
}

enum class AnalyticsPeriod {
    MONTHLY,
    WEEKLY
}

data class CategoryExpenseSummary(
    val category: Category,
    val amount: Double,
    val percentage: Float
)

data class CategoryBudgetStatus(
    val category: Category,
    val spentThisMonth: Double,
    val monthlyCap: Double, // 0 means unset
    val isSet: Boolean,
    val percentUsed: Float,
    val isOverBudget: Boolean,
    val remainingOrOverAmount: Double
)

data class PeriodData(
    val label: String,
    val income: Double,
    val expense: Double
)

class BudgetViewModel(application: Application) : AndroidViewModel(application) {

    private val database = ShadowXDatabase.getDatabase(application)
    private val authManager = AuthManager(application, database)
    private val repository = BudgetRepository(database)

    val activeUserId: StateFlow<String?> = authManager.activeUserId
    val pendingOtp: StateFlow<PendingOtpSession?> = authManager.pendingOtp
    val savedUsers: StateFlow<List<User>> = authManager.savedUsers
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Active User
    @OptIn(ExperimentalCoroutinesApi::class)
    val currentUser: StateFlow<User?> = activeUserId.flatMapLatest { uid ->
        if (uid == null) flowOf(null)
        else database.userDao().getUserById(uid)
    }.combine(activeUserId) { userEntity, uid ->
        userEntity?.toDomain()
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    // Active User Transactions
    @OptIn(ExperimentalCoroutinesApi::class)
    val transactions: StateFlow<List<Transaction>> = activeUserId.flatMapLatest { uid ->
        if (uid == null) flowOf(emptyList())
        else repository.getTransactions(uid)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Active User Budgets
    @OptIn(ExperimentalCoroutinesApi::class)
    val budgets: StateFlow<List<CategoryBudget>> = activeUserId.flatMapLatest { uid ->
        if (uid == null) flowOf(emptyList())
        else repository.getBudgets(uid)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // UI Navigation & Modals
    private val _currentTab = MutableStateFlow(BudgetTab.HOME)
    val currentTab: StateFlow<BudgetTab> = _currentTab.asStateFlow()

    private val _isAddEntryOpen = MutableStateFlow(false)
    val isAddEntryOpen: StateFlow<Boolean> = _isAddEntryOpen.asStateFlow()

    private val _selectedBudgetCategory = MutableStateFlow<Category?>(null)
    val selectedBudgetCategory: StateFlow<Category?> = _selectedBudgetCategory.asStateFlow()

    private val _isAvatarPickerOpen = MutableStateFlow(false)
    val isAvatarPickerOpen: StateFlow<Boolean> = _isAvatarPickerOpen.asStateFlow()

    private val _isAccountSwitcherOpen = MutableStateFlow(false)
    val isAccountSwitcherOpen: StateFlow<Boolean> = _isAccountSwitcherOpen.asStateFlow()

    // Auth screen states
    private val _isEmailDialogVisible = MutableStateFlow(false)
    val isEmailDialogVisible: StateFlow<Boolean> = _isEmailDialogVisible.asStateFlow()

    private val _emailDialogProvider = MutableStateFlow("google")
    val emailDialogProvider: StateFlow<String> = _emailDialogProvider.asStateFlow()

    private val _emailErrorMessage = MutableStateFlow<String?>(null)
    val emailErrorMessage: StateFlow<String?> = _emailErrorMessage.asStateFlow()

    private val _emailTypoSuggestion = MutableStateFlow<String?>(null)
    val emailTypoSuggestion: StateFlow<String?> = _emailTypoSuggestion.asStateFlow()

    private val _otpErrorMessage = MutableStateFlow<String?>(null)
    val otpErrorMessage: StateFlow<String?> = _otpErrorMessage.asStateFlow()

    private val _analyticsPeriod = MutableStateFlow(AnalyticsPeriod.MONTHLY)
    val analyticsPeriod: StateFlow<AnalyticsPeriod> = _analyticsPeriod.asStateFlow()

    // Activity filter
    private val _activityFilter = MutableStateFlow("ALL") // "ALL", "EXPENSE", "INCOME"
    val activityFilter: StateFlow<String> = _activityFilter.asStateFlow()

    fun selectTab(tab: BudgetTab) {
        _currentTab.value = tab
    }

    fun openAddEntry() {
        _isAddEntryOpen.value = true
    }

    fun closeAddEntry() {
        _isAddEntryOpen.value = false
    }

    fun openBudgetSetting(category: Category) {
        _selectedBudgetCategory.value = category
    }

    fun closeBudgetSetting() {
        _selectedBudgetCategory.value = null
    }

    fun setAvatarPickerOpen(open: Boolean) {
        _isAvatarPickerOpen.value = open
    }

    fun setAccountSwitcherOpen(open: Boolean) {
        _isAccountSwitcherOpen.value = open
    }

    fun setAnalyticsPeriod(period: AnalyticsPeriod) {
        _analyticsPeriod.value = period
    }

    fun setActivityFilter(filter: String) {
        _activityFilter.value = filter
    }

    // Auth Actions
    fun openOAuthEmailFlow(provider: String, defaultEmail: String = "", defaultName: String = "") {
        _emailDialogProvider.value = provider
        _emailErrorMessage.value = null
        _emailTypoSuggestion.value = null
        _isEmailDialogVisible.value = true
    }

    fun closeEmailDialog() {
        _isEmailDialogVisible.value = false
        _emailErrorMessage.value = null
        _emailTypoSuggestion.value = null
    }

    fun checkEmailTypo(email: String) {
        _emailTypoSuggestion.value = EmailValidator.checkTypoSuggestion(email)
    }

    fun submitEmailForOtp(name: String, email: String, confirmEmail: String) {
        when (val validation = EmailValidator.validate(email, confirmEmail)) {
            is EmailValidator.ValidationResult.InvalidFormat -> {
                _emailErrorMessage.value = validation.message
                return
            }
            is EmailValidator.ValidationResult.DisposableDomain -> {
                _emailErrorMessage.value = validation.message
                return
            }
            is EmailValidator.ValidationResult.PlaceholderLocalPart -> {
                _emailErrorMessage.value = validation.message
                return
            }
            is EmailValidator.ValidationResult.MismatchedConfirmation -> {
                _emailErrorMessage.value = validation.message
                return
            }
            EmailValidator.ValidationResult.Valid -> {
                _emailErrorMessage.value = null
            }
        }

        // Check if there is an existing account with this email
        val existing = savedUsers.value.firstOrNull { it.email.equals(email.trim(), ignoreCase = true) }
        authManager.startOtpFlow(
            email = email.trim(),
            name = name.trim().ifEmpty { email.substringBefore("@") },
            provider = _emailDialogProvider.value,
            existingUid = existing?.uid
        )
        _isEmailDialogVisible.value = false
        _otpErrorMessage.value = null
    }

    fun selectExistingAccountForLogin(user: User) {
        authManager.startOtpFlow(
            email = user.email,
            name = user.name,
            provider = user.provider,
            existingUid = user.uid
        )
        _isAccountSwitcherOpen.value = false
        _otpErrorMessage.value = null
    }

    fun verifyOtp(code: String) {
        viewModelScope.launch {
            val result = authManager.verifyOtp(code)
            if (result.isFailure) {
                _otpErrorMessage.value = result.exceptionOrNull()?.message ?: "Verification failed."
            } else {
                _otpErrorMessage.value = null
            }
        }
    }

    fun resendOtp() {
        _otpErrorMessage.value = null
        authManager.resendOtp()
    }

    fun cancelOtp() {
        _otpErrorMessage.value = null
        authManager.cancelOtp()
    }

    fun logout() {
        authManager.logout()
        _currentTab.value = BudgetTab.HOME
    }

    fun updateUserAvatar(avatarUrl: String?) {
        viewModelScope.launch {
            authManager.updateUserAvatar(avatarUrl)
            _isAvatarPickerOpen.value = false
        }
    }

    // Transactions and Budgets
    fun addTransaction(
        type: TransactionType,
        categoryId: String,
        amount: Double,
        dateMillis: Long,
        note: String
    ) {
        val uid = activeUserId.value ?: return
        viewModelScope.launch {
            val transaction = Transaction(
                userId = uid,
                type = type,
                categoryId = categoryId,
                amount = amount,
                dateMillis = dateMillis,
                note = note.trim()
            )
            repository.addTransaction(transaction)
            _isAddEntryOpen.value = false
        }
    }

    fun deleteTransaction(id: String) {
        val uid = activeUserId.value ?: return
        viewModelScope.launch {
            repository.deleteTransaction(id, uid)
        }
    }

    fun setBudget(categoryId: String, monthlyCap: Double) {
        val uid = activeUserId.value ?: return
        viewModelScope.launch {
            if (monthlyCap <= 0.0) {
                repository.removeCategoryBudget(uid, categoryId)
            } else {
                repository.setCategoryBudget(
                    CategoryBudget(userId = uid, categoryId = categoryId, monthlyCap = monthlyCap)
                )
            }
            _selectedBudgetCategory.value = null
        }
    }

    fun removeBudget(categoryId: String) {
        val uid = activeUserId.value ?: return
        viewModelScope.launch {
            repository.removeCategoryBudget(uid, categoryId)
            _selectedBudgetCategory.value = null
        }
    }

    // Helper calculations for UI
    fun getCategoryBudgetStatusList(
        transactionsList: List<Transaction>,
        budgetsList: List<CategoryBudget>
    ): List<CategoryBudgetStatus> {
        val currentMonthTransactions = getThisMonthExpenses(transactionsList)
        val budgetMap = budgetsList.associateBy { it.categoryId }

        return Category.EXPENSE_CATEGORIES.map { category ->
            val spent = currentMonthTransactions
                .filter { it.categoryId == category.id }
                .sumOf { it.amount }
            val cap = budgetMap[category.id]?.monthlyCap ?: 0.0
            val isSet = cap > 0.0
            val percentUsed = if (isSet) ((spent / cap) * 100).toFloat() else 0f
            val isOver = isSet && spent > cap
            val diff = if (isSet) (cap - spent) else 0.0

            CategoryBudgetStatus(
                category = category,
                spentThisMonth = spent,
                monthlyCap = cap,
                isSet = isSet,
                percentUsed = percentUsed,
                isOverBudget = isOver,
                remainingOrOverAmount = kotlin.math.abs(diff)
            )
        }
    }

    fun getTop5Expenses(transactionsList: List<Transaction>): List<CategoryExpenseSummary> {
        val expenseTx = transactionsList.filter { it.type == TransactionType.EXPENSE }
        val totalExp = expenseTx.sumOf { it.amount }

        val grouped = expenseTx.groupBy { it.categoryId }
            .map { (catId, txs) ->
                val amount = txs.sumOf { it.amount }
                val pct = if (totalExp > 0) (amount / totalExp * 100).toFloat() else 0f
                CategoryExpenseSummary(
                    category = Category.findById(catId),
                    amount = amount,
                    percentage = pct
                )
            }
            .sortedByDescending { it.amount }
            .take(5)

        return grouped
    }

    fun getExpenseBreakdownForAnalytics(transactionsList: List<Transaction>): List<CategoryExpenseSummary> {
        val expenseTx = transactionsList.filter { it.type == TransactionType.EXPENSE }
        val totalExp = expenseTx.sumOf { it.amount }
        if (totalExp == 0.0) return emptyList()

        return expenseTx.groupBy { it.categoryId }
            .map { (catId, txs) ->
                val amount = txs.sumOf { it.amount }
                val pct = (amount / totalExp * 100).toFloat()
                CategoryExpenseSummary(
                    category = Category.findById(catId),
                    amount = amount,
                    percentage = pct
                )
            }
            .sortedByDescending { it.amount }
            .take(6)
    }

    fun getAnalyticsPeriods(
        transactionsList: List<Transaction>,
        period: AnalyticsPeriod
    ): List<PeriodData> {
        val cal = Calendar.getInstance()
        val result = mutableListOf<PeriodData>()

        if (period == AnalyticsPeriod.MONTHLY) {
            val monthFormat = SimpleDateFormat("MMM", Locale.US)
            for (i in 5 downTo 0) {
                val c = Calendar.getInstance()
                c.add(Calendar.MONTH, -i)
                val year = c.get(Calendar.YEAR)
                val month = c.get(Calendar.MONTH)
                val label = monthFormat.format(c.time)

                val income = transactionsList.filter {
                    it.type == TransactionType.INCOME && isSameMonth(it.dateMillis, year, month)
                }.sumOf { it.amount }

                val expense = transactionsList.filter {
                    it.type == TransactionType.EXPENSE && isSameMonth(it.dateMillis, year, month)
                }.sumOf { it.amount }

                result.add(PeriodData(label = label, income = income, expense = expense))
            }
        } else {
            // Weekly: last 6 weeks
            for (i in 5 downTo 0) {
                val c = Calendar.getInstance()
                c.add(Calendar.WEEK_OF_YEAR, -i)
                val week = c.get(Calendar.WEEK_OF_YEAR)
                val year = c.get(Calendar.YEAR)
                val label = "W${6 - i}"

                val income = transactionsList.filter {
                    it.type == TransactionType.INCOME && isSameWeek(it.dateMillis, year, week)
                }.sumOf { it.amount }

                val expense = transactionsList.filter {
                    it.type == TransactionType.EXPENSE && isSameWeek(it.dateMillis, year, week)
                }.sumOf { it.amount }

                result.add(PeriodData(label = label, income = income, expense = expense))
            }
        }
        return result
    }

    private fun getThisMonthExpenses(transactionsList: List<Transaction>): List<Transaction> {
        val now = Calendar.getInstance()
        val year = now.get(Calendar.YEAR)
        val month = now.get(Calendar.MONTH)
        return transactionsList.filter {
            it.type == TransactionType.EXPENSE && isSameMonth(it.dateMillis, year, month)
        }
    }

    private fun isSameMonth(millis: Long, targetYear: Int, targetMonth: Int): Boolean {
        val c = Calendar.getInstance().apply { timeInMillis = millis }
        return c.get(Calendar.YEAR) == targetYear && c.get(Calendar.MONTH) == targetMonth
    }

    private fun isSameWeek(millis: Long, targetYear: Int, targetWeek: Int): Boolean {
        val c = Calendar.getInstance().apply { timeInMillis = millis }
        return c.get(Calendar.YEAR) == targetYear && c.get(Calendar.WEEK_OF_YEAR) == targetWeek
    }
}
