export enum BudgetCategory {
  ESSENTIAL = 'ESSENTIAL',
  FLEXIBLE = 'FLEXIBLE',
  DISCRETIONARY = 'DISCRETIONARY',
}

export enum BudgetStatus {
  OK = 'OK',
  WARNING = 'WARNING',
  EXCEEDED = 'EXCEEDED',
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // YYYY-MM format
  totalAmount: number;
  rolloverEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetAllocation {
  id: string;
  budgetId: string;
  category: BudgetCategory;
  allocatedAmount: number;
  spentAmount: number;
  rolloverPercentage: number;
  alertThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetWithAllocations extends Budget {
  allocations: BudgetAllocation[];
}

export interface BudgetSpending {
  budgetId: string;
  userId: string;
  month: string;
  totalBudget: number;
  rolloverEnabled: boolean;
  allocationId: string;
  category: BudgetCategory;
  allocatedAmount: number;
  alertThreshold: number;
  actualSpent: number;
  remainingAmount: number;
  spentPercentage: number;
  status: BudgetStatus;
}

export interface BudgetAlert {
  budgetId: string;
  month: string;
  category: BudgetCategory;
  allocatedAmount: number;
  actualSpent: number;
  spentPercentage: number;
  status: BudgetStatus;
}
