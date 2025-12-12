import { TransactionCategory } from '../types/Transaction';
import { BudgetCategory } from '../types/Budget';

export const TransactionToBudgetCategory: Record<TransactionCategory, BudgetCategory> = {
  // Essential
  [TransactionCategory.RENT]: BudgetCategory.ESSENTIAL,
  [TransactionCategory.UTILITIES]: BudgetCategory.ESSENTIAL,
  [TransactionCategory.GROCERIES]: BudgetCategory.ESSENTIAL,
  [TransactionCategory.HEALTHCARE]: BudgetCategory.ESSENTIAL,
  [TransactionCategory.INSURANCE]: BudgetCategory.ESSENTIAL,
  
  // Flexible
  [TransactionCategory.DINING]: BudgetCategory.FLEXIBLE,
  [TransactionCategory.SHOPPING]: BudgetCategory.FLEXIBLE,
  [TransactionCategory.TRANSPORTATION]: BudgetCategory.FLEXIBLE,
  [TransactionCategory.TRAVEL]: BudgetCategory.FLEXIBLE,
  
  // Discretionary
  [TransactionCategory.ENTERTAINMENT]: BudgetCategory.DISCRETIONARY,
  [TransactionCategory.HOBBIES]: BudgetCategory.DISCRETIONARY,
  [TransactionCategory.SUBSCRIPTIONS]: BudgetCategory.DISCRETIONARY,
  [TransactionCategory.EDUCATION]: BudgetCategory.DISCRETIONARY,
  
  // Other (map to flexible by default)
  [TransactionCategory.INVESTMENT]: BudgetCategory.FLEXIBLE,
  [TransactionCategory.SALARY]: BudgetCategory.FLEXIBLE,
  [TransactionCategory.TRANSFER]: BudgetCategory.FLEXIBLE,
  [TransactionCategory.OTHER]: BudgetCategory.FLEXIBLE,
};
