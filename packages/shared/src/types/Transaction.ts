export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  category: TransactionCategory;
  merchant?: string;
  description?: string;
  type: TransactionType;
  source: TransactionSource;
  timestamp: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export enum TransactionType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export enum TransactionSource {
  ACCOUNT_AGGREGATOR = 'ACCOUNT_AGGREGATOR',
  SMS_PARSED = 'SMS_PARSED',
  MANUAL_ENTRY = 'MANUAL_ENTRY',
  BANK_SYNC = 'BANK_SYNC',
}

export enum TransactionCategory {
  // Essential
  RENT = 'RENT',
  UTILITIES = 'UTILITIES',
  GROCERIES = 'GROCERIES',
  HEALTHCARE = 'HEALTHCARE',
  INSURANCE = 'INSURANCE',
  
  // Flexible
  DINING = 'DINING',
  SHOPPING = 'SHOPPING',
  TRANSPORTATION = 'TRANSPORTATION',
  TRAVEL = 'TRAVEL',
  
  // Discretionary
  ENTERTAINMENT = 'ENTERTAINMENT',
  HOBBIES = 'HOBBIES',
  SUBSCRIPTIONS = 'SUBSCRIPTIONS',
  EDUCATION = 'EDUCATION',
  
  // Other
  INVESTMENT = 'INVESTMENT',
  SALARY = 'SALARY',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER',
}

export interface TransactionCreateInput {
  userId: string;
  amount: number;
  currency?: string;
  category: TransactionCategory;
  merchant?: string;
  description?: string;
  type: TransactionType;
  source: TransactionSource;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface TransactionFilters {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  category?: TransactionCategory;
  type?: TransactionType;
  source?: TransactionSource;
  minAmount?: number;
  maxAmount?: number;
}
