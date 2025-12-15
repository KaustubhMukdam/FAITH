export enum KYCStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export interface UserPreferences {
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    dailyInsights: boolean;
    weeklyReports: boolean;
    budgetAlerts: boolean;
    investmentUpdates: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  kycStatus: KYCStatus;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

export interface UserCreateInput {
  email: string;
  phone: string;
  name: string;
  password: string;
}

export interface UserUpdateInput {
  name?: string;
  phone?: string;
  kycStatus?: KYCStatus;
  preferences?: Partial<UserPreferences>;
}
