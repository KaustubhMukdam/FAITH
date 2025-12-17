import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import apiService from '../../services/api';

export default function BudgetsScreen() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBudgets = async () => {
    try {
      const response = await apiService.getBudgets();
      setBudgets(response.data.budgets || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBudgets();
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
      {budgets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>í³Š</Text>
          <Text style={styles.emptyText}>No budgets yet</Text>
          <Text style={styles.emptySubtext}>
            Create a budget to track your spending
          </Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {budgets.map((budget: any, index: number) => (
            <View key={index} style={styles.budgetCard}>
              <View style={styles.budgetHeader}>
                <Text style={styles.budgetCategory}>{budget.category}</Text>
                <Text style={styles.budgetPeriod}>
                  {new Date(budget.start_date).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>

              <View style={styles.budgetAmounts}>
                <View>
                  <Text style={styles.budgetLabel}>Spent</Text>
                  <Text style={styles.budgetSpent}>
                    â‚¹{budget.spent?.toLocaleString() || '0'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.budgetLabel}>Budget</Text>
                  <Text style={styles.budgetLimit}>
                    â‚¹{budget.limit_amount?.toLocaleString() || '0'}
                  </Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        ((budget.spent || 0) / (budget.limit_amount || 1)) * 100,
                        100
                      )}%`,
                      backgroundColor:
                        (budget.spent || 0) > (budget.limit_amount || 0)
                          ? Colors.error
                          : Colors.success,
                    },
                  ]}
                />
              </View>

              <Text style={styles.budgetPercentage}>
                {(
                  ((budget.spent || 0) / (budget.limit_amount || 1)) *
                  100
                ).toFixed(1)}
                % used
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
  contentContainer: {
    padding: Spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl * 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  budgetCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  budgetCategory: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  budgetPeriod: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  budgetAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  budgetLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  budgetSpent: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.error,
  },
  budgetLimit: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  budgetPercentage: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
});
