export interface Budget {
  id: string;
  userId: string;
  month: string; // Format: YYYY-MM
  totalAmount: number;
  allocations: BudgetAllocation[];
  rolloverEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetAllocation {
  category: BudgetCategory;
  allocatedAmount: number;
  spentAmount: number;
  rolloverPercentage: number; // 0-100
  alertThreshold: number; // 0-100, trigger alert at X% spent
}

export enum BudgetCategory {
  ESSENTIAL = 'ESSENTIAL',
  FLEXIBLE = 'FLEXIBLE',
  DISCRETIONARY = 'DISCRETIONARY',
}

export interface BudgetCreateInput {
  userId: string;
  month: string;
  totalAmount: number;
  allocations: BudgetAllocationInput[];
  rolloverEnabled?: boolean;
}

export interface BudgetAllocationInput {
  category: BudgetCategory;
  allocatedAmount: number;
  rolloverPercentage?: number;
  alertThreshold?: number;
}

export interface BudgetStatus {
  budgetId: string;
  month: string;
  totalAllocated: number;
  totalSpent: number;
  percentageUsed: number;
  categories: CategoryStatus[];
  isOverBudget: boolean;
}

export interface CategoryStatus {
  category: BudgetCategory;
  allocated: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
}
