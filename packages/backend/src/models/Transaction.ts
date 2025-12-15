export enum TransactionType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export enum TransactionCategory {
  // Income categories
  SALARY = 'SALARY',
  FREELANCE = 'FREELANCE',
  INVESTMENT = 'INVESTMENT',
  BUSINESS = 'BUSINESS',
  GIFT = 'GIFT',
  OTHER_INCOME = 'OTHER_INCOME',
  
  // Expense categories
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
  recurringFrequency?: string;
  tags: string[];
  location?: string;
  merchant?: string;
  notes?: string;
  linkedAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
}
