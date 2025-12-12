import { Budget, BudgetAllocation, CategoryStatus } from '../types/Budget';

export function calculateBudgetStatus(
  budget: Budget,
  transactions: { category: string; amount: number }[]
): CategoryStatus[] {
  return budget.allocations.map((allocation) => {
    const spent = transactions
      .filter((t) => t.category === allocation.category)
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = allocation.allocatedAmount - spent;
    const percentageUsed = (spent / allocation.allocatedAmount) * 100;
    const isOverBudget = spent > allocation.allocatedAmount;

    return {
      category: allocation.category,
      allocated: allocation.allocatedAmount,
      spent,
      remaining,
      percentageUsed,
      isOverBudget,
    };
  });
}

export function shouldTriggerAlert(allocation: BudgetAllocation, spent: number): boolean {
  const percentageUsed = (spent / allocation.allocatedAmount) * 100;
  return percentageUsed >= allocation.alertThreshold;
}
