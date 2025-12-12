export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  kycStatus: KYCStatus;
  preferences: UserPreferences;
}

export enum KYCStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export interface UserPreferences {
  currency: string;
  language: string;
  notifications: NotificationPreferences;
  theme: 'light' | 'dark' | 'auto';
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  dailyInsights: boolean;
  weeklyReports: boolean;
  budgetAlerts: boolean;
  investmentUpdates: boolean;
}

export interface UserCreateInput {
  email: string;
  phone: string;
  name: string;
  password: string;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  preferences?: Partial<UserPreferences>;
}
