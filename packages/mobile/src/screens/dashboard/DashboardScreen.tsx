import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import apiService from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function DashboardScreen({ navigation }: any) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  const fetchSummary = async () => {
    try {
      const response = await apiService.getTransactionSummary();
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name}! 👋</Text>
        <Text style={styles.subtitle}>Here's your financial overview</Text>
      </View>

      {/* Balance Cards */}
      <View style={styles.balanceContainer}>
        <View style={[styles.balanceCard, { backgroundColor: Colors.success }]}>
          <Text style={styles.balanceLabel}>Total Income</Text>
          <Text style={styles.balanceAmount}>
            ₹{summary?.totalIncome?.toLocaleString() || '0'}
          </Text>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: Colors.error }]}>
          <Text style={styles.balanceLabel}>Total Expense</Text>
          <Text style={styles.balanceAmount}>
            ₹{summary?.totalExpense?.toLocaleString() || '0'}
          </Text>
        </View>
      </View>

      <View style={styles.netBalanceCard}>
        <Text style={styles.netBalanceLabel}>Net Balance</Text>
        <Text
          style={[
            styles.netBalanceAmount,
            {
              color:
                (summary?.netBalance || 0) >= 0
                  ? Colors.success
                  : Colors.error,
            },
          ]}
        >
          ₹{summary?.netBalance?.toLocaleString() || '0'}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Transactions')}
          >
            <Text style={styles.actionIcon}>💰</Text>
            <Text style={styles.actionText}>Add Transaction</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Budgets')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>View Budgets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Transactions')}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionText}>All Transactions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Accounts')}
          >
            <Text style={styles.actionIcon}>🏦</Text>
            <Text style={styles.actionText}>Linked Accounts</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Breakdown */}
      {summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Spending Categories</Text>
          {summary.categoryBreakdown.slice(0, 5).map((cat: any, index: number) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{cat.category}</Text>
                <Text style={styles.categoryAmount}>
                  ₹{cat.total.toLocaleString()}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(cat.percentage, 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.categoryPercentage}>
                {cat.percentage.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  greeting: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  balanceContainer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  balanceCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  balanceLabel: {
    fontSize: FontSizes.sm,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: '#FFF',
  },
  netBalanceCard: {
    margin: Spacing.lg,
    marginTop: 0,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  netBalanceLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  netBalanceAmount: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  actionText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    textAlign: 'center',
  },
  categoryItem: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  categoryName: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: FontSizes.md,
    color: Colors.error,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
  },
  categoryPercentage: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
});