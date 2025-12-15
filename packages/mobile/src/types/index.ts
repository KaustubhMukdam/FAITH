export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description: string;
  merchant?: string;
  date: string;
  paymentMode?: string;
}

export interface Budget {
  id: string;
  month: string;
  totalAmount: number;
  allocations: BudgetAllocation[];
}

export interface BudgetAllocation {
  id: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  alertThreshold: number;
}

export interface LinkedAccount {
  id: string;
  accountType: string;
  provider: string;
  accountNumber?: string;
  accountBalance?: number;
  syncStatus: string;
}
