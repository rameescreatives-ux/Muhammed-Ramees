package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.model.TransactionType
import com.example.ui.components.ShadowXBottomBar
import com.example.ui.screens.AccountSwitcherBottomSheet
import com.example.ui.screens.ActivityScreen
import com.example.ui.screens.AddEntryBottomSheet
import com.example.ui.screens.AnalyticsScreen
import com.example.ui.screens.AuthScreen
import com.example.ui.screens.AvatarPickerBottomSheet
import com.example.ui.screens.BudgetScreen
import com.example.ui.screens.EmailValidationDialog
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.OtpVerificationScreen
import com.example.ui.screens.SetBudgetBottomSheet
import com.example.ui.theme.ShadowXTheme
import com.example.ui.viewmodel.BudgetTab
import com.example.ui.viewmodel.BudgetViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            ShadowXTheme {
                ShadowXBudgetApp()
            }
        }
    }
}

@Composable
fun ShadowXBudgetApp(
    viewModel: BudgetViewModel = viewModel()
) {
    val currentUser by viewModel.currentUser.collectAsStateWithLifecycle()
    val savedUsers by viewModel.savedUsers.collectAsStateWithLifecycle()
    val pendingOtp by viewModel.pendingOtp.collectAsStateWithLifecycle()

    val currentTab by viewModel.currentTab.collectAsStateWithLifecycle()
    val transactions by viewModel.transactions.collectAsStateWithLifecycle()
    val budgets by viewModel.budgets.collectAsStateWithLifecycle()

    val isAddEntryOpen by viewModel.isAddEntryOpen.collectAsStateWithLifecycle()
    val selectedBudgetCategory by viewModel.selectedBudgetCategory.collectAsStateWithLifecycle()
    val isAvatarPickerOpen by viewModel.isAvatarPickerOpen.collectAsStateWithLifecycle()
    val isAccountSwitcherOpen by viewModel.isAccountSwitcherOpen.collectAsStateWithLifecycle()

    val isEmailDialogVisible by viewModel.isEmailDialogVisible.collectAsStateWithLifecycle()
    val emailDialogProvider by viewModel.emailDialogProvider.collectAsStateWithLifecycle()
    val emailErrorMessage by viewModel.emailErrorMessage.collectAsStateWithLifecycle()
    val emailTypoSuggestion by viewModel.emailTypoSuggestion.collectAsStateWithLifecycle()
    val otpErrorMessage by viewModel.otpErrorMessage.collectAsStateWithLifecycle()

    val analyticsPeriod by viewModel.analyticsPeriod.collectAsStateWithLifecycle()
    val activityFilter by viewModel.activityFilter.collectAsStateWithLifecycle()

    // Handle Predictive Back / Hardware Back Navigation
    BackHandler(enabled = pendingOtp != null || currentTab != BudgetTab.HOME) {
        if (pendingOtp != null) {
            viewModel.cancelOtp()
        } else if (currentTab != BudgetTab.HOME) {
            viewModel.selectTab(BudgetTab.HOME)
        }
    }

    if (currentUser == null) {
        // Authenticating / Logged Out Flow
        if (pendingOtp != null) {
            OtpVerificationScreen(
                session = pendingOtp!!,
                errorMessage = otpErrorMessage,
                onVerify = { code -> viewModel.verifyOtp(code) },
                onResend = { viewModel.resendOtp() },
                onChangeEmail = { viewModel.cancelOtp() }
            )
        } else {
            AuthScreen(
                savedUsers = savedUsers,
                onContinueWithGoogle = {
                    viewModel.openOAuthEmailFlow(
                        provider = "google",
                        defaultEmail = "razal@shadowxstudio.ae",
                        defaultName = "Razal Muhammed"
                    )
                },
                onContinueWithApple = {
                    viewModel.openOAuthEmailFlow(
                        provider = "apple",
                        defaultEmail = "studio@shadowx.design",
                        defaultName = "Studio Director"
                    )
                },
                onContinueWithEmail = {
                    viewModel.openOAuthEmailFlow(
                        provider = "email",
                        defaultEmail = "",
                        defaultName = ""
                    )
                },
                onSelectExistingAccount = { user ->
                    viewModel.selectExistingAccountForLogin(user)
                }
            )
        }

        // Email Validation Dialog
        if (isEmailDialogVisible) {
            EmailValidationDialog(
                provider = emailDialogProvider,
                errorMessage = emailErrorMessage,
                typoSuggestion = emailTypoSuggestion,
                onTypoSuggestionSelected = { email -> viewModel.checkEmailTypo(email) },
                onSubmit = { name, email, confirmEmail ->
                    viewModel.submitEmailForOtp(name, email, confirmEmail)
                },
                onDismiss = { viewModel.closeEmailDialog() }
            )
        }
    } else {
        // Logged In Workspace
        val user = currentUser!!

        // Compute metrics
        val totalIncome = transactions.filter { it.type == TransactionType.INCOME }.sumOf { it.amount }
        val totalExpenses = transactions.filter { it.type == TransactionType.EXPENSE }.sumOf { it.amount }
        val totalBalance = totalIncome - totalExpenses

        val budgetStatuses = viewModel.getCategoryBudgetStatusList(transactions, budgets)
        val top5Expenses = viewModel.getTop5Expenses(transactions)
        val periodsData = viewModel.getAnalyticsPeriods(transactions, analyticsPeriod)
        val breakdown = viewModel.getExpenseBreakdownForAnalytics(transactions)

        Scaffold(
            modifier = Modifier.fillMaxSize(),
            bottomBar = {
                ShadowXBottomBar(
                    currentTab = currentTab,
                    onTabSelected = { tab -> viewModel.selectTab(tab) }
                )
            }
        ) { innerPadding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                AnimatedContent(
                    targetState = currentTab,
                    transitionSpec = { fadeIn() togetherWith fadeOut() },
                    label = "tab_transition"
                ) { targetTab ->
                    when (targetTab) {
                        BudgetTab.HOME -> {
                            HomeScreen(
                                currentUser = user,
                                totalBalance = totalBalance,
                                totalIncome = totalIncome,
                                totalExpenses = totalExpenses,
                                top5Expenses = top5Expenses,
                                first4Budgets = budgetStatuses,
                                onOpenAddEntry = { viewModel.openAddEntry() },
                                onOpenBudgetSetting = { cat -> viewModel.openBudgetSetting(cat) },
                                onOpenAvatarPicker = { viewModel.setAvatarPickerOpen(true) },
                                onOpenAccountSwitcher = { viewModel.setAccountSwitcherOpen(true) },
                                onLogout = { viewModel.logout() },
                                onNavigateToBudgetTab = { viewModel.selectTab(BudgetTab.BUDGET) }
                            )
                        }

                        BudgetTab.BUDGET -> {
                            BudgetScreen(
                                budgetStatuses = budgetStatuses,
                                onOpenBudgetSetting = { cat -> viewModel.openBudgetSetting(cat) }
                            )
                        }

                        BudgetTab.ANALYTICS -> {
                            AnalyticsScreen(
                                period = analyticsPeriod,
                                periodsData = periodsData,
                                breakdown = breakdown,
                                onSelectPeriod = { p -> viewModel.setAnalyticsPeriod(p) }
                            )
                        }

                        BudgetTab.ACTIVITY -> {
                            ActivityScreen(
                                transactions = transactions,
                                filter = activityFilter,
                                onFilterChange = { f -> viewModel.setActivityFilter(f) },
                                onDeleteTransaction = { id -> viewModel.deleteTransaction(id) },
                                onLogout = { viewModel.logout() }
                            )
                        }
                    }
                }
            }
        }

        // Modals & BottomSheets
        if (isAddEntryOpen) {
            AddEntryBottomSheet(
                onSave = { type, categoryId, amount, dateMillis, note ->
                    viewModel.addTransaction(type, categoryId, amount, dateMillis, note)
                },
                onDismiss = { viewModel.closeAddEntry() }
            )
        }

        if (selectedBudgetCategory != null) {
            val cat = selectedBudgetCategory!!
            val currentCap = budgets.firstOrNull { it.categoryId == cat.id }?.monthlyCap ?: 0.0
            SetBudgetBottomSheet(
                category = cat,
                currentCap = currentCap,
                onSaveBudget = { cap -> viewModel.setBudget(cat.id, cap) },
                onRemoveBudget = { viewModel.removeBudget(cat.id) },
                onDismiss = { viewModel.closeBudgetSetting() }
            )
        }

        if (isAvatarPickerOpen) {
            AvatarPickerBottomSheet(
                currentAvatar = user.avatarUrl,
                userName = user.name,
                onAvatarSelected = { avatarId -> viewModel.updateUserAvatar(avatarId) },
                onDismiss = { viewModel.setAvatarPickerOpen(false) }
            )
        }

        if (isAccountSwitcherOpen) {
            AccountSwitcherBottomSheet(
                currentUser = user,
                savedUsers = savedUsers,
                onSelectAccount = { targetUser ->
                    viewModel.selectExistingAccountForLogin(targetUser)
                },
                onAddNewAccount = {
                    viewModel.logout()
                    viewModel.setAccountSwitcherOpen(false)
                },
                onDismiss = { viewModel.setAccountSwitcherOpen(false) }
            )
        }
    }
}
