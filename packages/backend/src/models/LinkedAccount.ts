export enum AccountType {
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  CREDIT_CARD = 'CREDIT_CARD',
  WALLET = 'WALLET',
  INVESTMENT = 'INVESTMENT',
}

export enum SyncStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  FAILED = 'FAILED',
  DISABLED = 'DISABLED',
}

export enum SyncFrequency {
  REALTIME = 'REALTIME',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MANUAL = 'MANUAL',
}

export interface LinkedAccount {
  id: string;
  userId: string;
  accountType: AccountType;
  provider: string;
  accountNumber?: string;
  accountHolderName?: string;
  ifscCode?: string;
  accountBalance?: number;
  currency: string;
  lastSyncedAt?: Date;
  syncStatus: SyncStatus;
  syncFrequency: SyncFrequency;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ConsentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface AASession {
  id: string;
  userId: string;
  sessionId: string;
  consentHandle?: string;
  consentStatus: ConsentStatus;
  fiuId?: string;
  accountsDiscovered: number;
  consentStartDate?: Date;
  consentEndDate?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SMSTransaction {
  id: string;
  userId: string;
  linkedAccountId?: string;
  rawSms: string;
  sender: string;
  receivedAt: Date;
  parsedAmount?: number;
  parsedType?: 'DEBIT' | 'CREDIT';
  parsedMerchant?: string;
  parsedCategory?: string;
  isProcessed: boolean;
  transactionId?: string;
  confidenceScore?: number;
  createdAt: Date;
}

export interface SyncLog {
  id: string;
  userId: string;
  linkedAccountId?: string;
  syncType: string;
  status: string;
  transactionsFetched: number;
  transactionsCreated: number;
  transactionsUpdated: number;
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
}
