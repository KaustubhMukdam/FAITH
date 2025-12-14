import { User, KYCStatus } from '@faith/shared';

export interface UserRow {
  id: string;
  email: string;
  phone: string;
  name: string;
  password_hash: string;
  kyc_status: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserPreferencesRow {
  id: string;
  user_id: string;
  currency: string;
  language: string;
  theme: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  daily_insights: boolean;
  weekly_reports: boolean;
  budget_alerts: boolean;
  investment_updates: boolean;
  created_at: Date;
  updated_at: Date;
}

// Helper to convert DB row to User object
export function toUser(row: UserRow, preferences?: UserPreferencesRow): User {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    name: row.name,
    kycStatus: row.kyc_status as KYCStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    preferences: preferences
      ? {
          currency: preferences.currency,
          language: preferences.language,
          theme: preferences.theme as 'light' | 'dark' | 'auto',
          notifications: {
            email: preferences.email_notifications,
            sms: preferences.sms_notifications,
            push: preferences.push_notifications,
            dailyInsights: preferences.daily_insights,
            weeklyReports: preferences.weekly_reports,
            budgetAlerts: preferences.budget_alerts,
            investmentUpdates: preferences.investment_updates,
          },
        }
      : {
          currency: 'INR',
          language: 'en',
          theme: 'auto',
          notifications: {
            email: true,
            sms: true,
            push: true,
            dailyInsights: true,
            weeklyReports: true,
            budgetAlerts: true,
            investmentUpdates: false,
          },
        },
  };
}
