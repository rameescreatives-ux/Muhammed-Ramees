package com.example.ui.components

import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material.icons.outlined.Assessment
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.PieChart
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.ShadowXGold
import com.example.ui.theme.ShadowXNavy
import com.example.ui.theme.ShadowXTeal
import com.example.ui.viewmodel.BudgetTab

@Composable
fun ShadowXBottomBar(
    currentTab: BudgetTab,
    onTabSelected: (BudgetTab) -> Unit,
    modifier: Modifier = Modifier
) {
    NavigationBar(
        modifier = modifier.testTag("main_bottom_nav"),
        windowInsets = WindowInsets.navigationBars,
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 8.dp
    ) {
        // Home
        ShadowXNavItem(
            selected = currentTab == BudgetTab.HOME,
            onClick = { onTabSelected(BudgetTab.HOME) },
            label = "Home",
            selectedIcon = Icons.Filled.Home,
            unselectedIcon = Icons.Outlined.Home,
            testTag = "nav_tab_home"
        )

        // Budget
        ShadowXNavItem(
            selected = currentTab == BudgetTab.BUDGET,
            onClick = { onTabSelected(BudgetTab.BUDGET) },
            label = "Budget",
            selectedIcon = Icons.Filled.PieChart,
            unselectedIcon = Icons.Outlined.PieChart,
            testTag = "nav_tab_budget"
        )

        // Analytics
        ShadowXNavItem(
            selected = currentTab == BudgetTab.ANALYTICS,
            onClick = { onTabSelected(BudgetTab.ANALYTICS) },
            label = "Analytics",
            selectedIcon = Icons.Filled.Assessment,
            unselectedIcon = Icons.Outlined.Assessment,
            testTag = "nav_tab_analytics"
        )

        // Activity
        ShadowXNavItem(
            selected = currentTab == BudgetTab.ACTIVITY,
            onClick = { onTabSelected(BudgetTab.ACTIVITY) },
            label = "Activity",
            selectedIcon = Icons.Filled.History,
            unselectedIcon = Icons.Outlined.History,
            testTag = "nav_tab_activity"
        )
    }
}

@Composable
private fun RowScope.ShadowXNavItem(
    selected: Boolean,
    onClick: () -> Unit,
    label: String,
    selectedIcon: androidx.compose.ui.graphics.vector.ImageVector,
    unselectedIcon: androidx.compose.ui.graphics.vector.ImageVector,
    testTag: String
) {
    NavigationBarItem(
        selected = selected,
        onClick = onClick,
        icon = {
            Icon(
                imageVector = if (selected) selectedIcon else unselectedIcon,
                contentDescription = label,
                modifier = Modifier.size(24.dp)
            )
        },
        label = {
            Text(
                text = label,
                fontSize = 11.sp,
                fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium
            )
        },
        colors = NavigationBarItemDefaults.colors(
            selectedIconColor = ShadowXTeal,
            selectedTextColor = ShadowXTeal,
            indicatorColor = ShadowXTeal.copy(alpha = 0.15f),
            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
        ),
        modifier = Modifier.testTag(testTag)
    )
}
