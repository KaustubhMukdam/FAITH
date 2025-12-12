export interface AAConsent {
  id: string;
  userId: string;
  consentId: string; // From AA provider
  status: AAConsentStatus;
  provider: AAProvider;
  linkedAccounts: LinkedBankAccount[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum AAConsentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export enum AAProvider {
  FINVU = 'FINVU',
  ONEMONEY = 'ONEMONEY',
  SETU = 'SETU',
  SAAFE = 'SAAFE',
}

export interface LinkedBankAccount {
  accountId: string;
  bankName: string;
  accountNumber: string; // Masked
  accountType: BankAccountType;
  linkedAt: Date;
}

export enum BankAccountType {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT',
  CREDIT_CARD = 'CREDIT_CARD',
}

export interface AAConsentRequest {
  userId: string;
  provider: AAProvider;
  purpose: string;
  dataRangeMonths: number; // How many months of history to fetch
}
