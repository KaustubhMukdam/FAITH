export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum TransactionCategory {
  // Income Categories
  SALARY = 'SALARY',
  FREELANCE = 'FREELANCE',
  INVESTMENT = 'INVESTMENT',
  BUSINESS = 'BUSINESS',
  GIFT = 'GIFT',
  OTHER_INCOME = 'OTHER_INCOME',

  // Expense Categories
  FOOD = 'FOOD',
  TRANSPORTATION = 'TRANSPORTATION',
  SHOPPING = 'SHOPPING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  BILLS = 'BILLS',
  HEALTHCARE = 'HEALTHCARE',
  EDUCATION = 'EDUCATION',
  TRAVEL = 'TRAVEL',
  GROCERIES = 'GROCERIES',
  RENT = 'RENT',
  EMI = 'EMI',
  INSURANCE = 'INSURANCE',
  INVESTMENT_EXPENSE = 'INVESTMENT_EXPENSE',
  OTHER_EXPENSE = 'OTHER_EXPENSE',
}

export enum PaymentMode {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
  NET_BANKING = 'NET_BANKING',
  WALLET = 'WALLET',
  OTHER = 'OTHER',
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  paymentMode: PaymentMode;
  date: Date;
  isRecurring: boolean;
  recurringFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  tags?: string[];
  notes?: string;
  attachments?: string[];
  merchant?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionCreateInput {
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  paymentMode: PaymentMode;
  date: Date;
  isRecurring?: boolean;
  recurringFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  tags?: string[];
  notes?: string;
  merchant?: string;
  location?: string;
}

export interface TransactionUpdateInput {
  type?: TransactionType;
  category?: TransactionCategory;
  amount?: number;
  description?: string;
  paymentMode?: PaymentMode;
  date?: Date;
  isRecurring?: boolean;
  recurringFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  tags?: string[];
  notes?: string;
  merchant?: string;
  location?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: TransactionCategory;
  paymentMode?: PaymentMode;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  categoryBreakdown: {
    category: TransactionCategory;
    total: number;
    count: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expense: number;
  }[];
}
