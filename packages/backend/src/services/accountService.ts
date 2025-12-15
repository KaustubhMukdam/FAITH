import pool from '../config/database';
import { AccountType, SyncStatus, SyncFrequency } from '../models/LinkedAccount';

interface LinkedAccountInput {
  accountType: AccountType;
  provider: string;
  accountNumber?: string;
  accountHolderName?: string;
  ifscCode?: string;
  syncFrequency?: SyncFrequency;
  metadata?: any;
}

export class AccountService {
  static async linkAccount(userId: string, data: LinkedAccountInput) {
    const {
      accountType,
      provider,
      accountNumber,
      accountHolderName,
      ifscCode,
      syncFrequency = SyncFrequency.DAILY,
      metadata = {},
    } = data;

    const query = `
      INSERT INTO linked_accounts (
        user_id, account_type, provider, account_number,
        account_holder_name, ifsc_code, sync_frequency, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      userId,
      accountType,
      provider,
      accountNumber || null,
      accountHolderName || null,
      ifscCode || null,
      syncFrequency,
      JSON.stringify(metadata),
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getLinkedAccounts(userId: string, includeInactive = false) {
    let query = 'SELECT * FROM linked_accounts WHERE user_id = $1';
    
    if (!includeInactive) {
      query += ' AND is_active = true';
    }
    
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async getAccountById(userId: string, accountId: string) {
    const query = `
      SELECT * FROM linked_accounts 
      WHERE id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [accountId, userId]);

    if (result.rows.length === 0) {
      throw new Error('Account not found');
    }

    return result.rows[0];
  }

  static async updateAccount(
    userId: string,
    accountId: string,
    data: {
      accountBalance?: number;
      syncStatus?: SyncStatus;
      syncFrequency?: SyncFrequency;
      lastSyncedAt?: Date;
      isActive?: boolean;
    }
  ) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    const allowedFields: Record<string, string> = {
      accountBalance: 'account_balance',
      syncStatus: 'sync_status',
      syncFrequency: 'sync_frequency',
      lastSyncedAt: 'last_synced_at',
      isActive: 'is_active',
    };

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && allowedFields[key]) {
        paramCount++;
        fields.push(`${allowedFields[key]} = $${paramCount}`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    paramCount++;
    values.push(accountId);
    paramCount++;
    values.push(userId);

    const query = `
      UPDATE linked_accounts 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Account not found');
    }

    return result.rows[0];
  }

  static async deleteAccount(userId: string, accountId: string) {
    // Soft delete by setting is_active to false
    const query = `
      UPDATE linked_accounts 
      SET is_active = false, sync_status = 'DISABLED'
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [accountId, userId]);
    
    if (result.rows.length === 0) {
      throw new Error('Account not found');
    }

    return result.rows[0];
  }

  static async syncAccount(userId: string, accountId: string) {
    // Verify account exists
    await this.getAccountById(userId, accountId);

    // Create sync log
    const logQuery = `
      INSERT INTO sync_logs (
        user_id, linked_account_id, sync_type, status, started_at
      ) VALUES ($1, $2, 'MANUAL', 'STARTED', CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const logResult = await pool.query(logQuery, [userId, accountId]);
    const syncLogId = logResult.rows[0].id;

    try {
      // TODO: Implement actual sync logic with Account Aggregator
      // For now, just simulate a successful sync
      
      const transactionsFetched = 0;
      const transactionsCreated = 0;

      // Update account last sync time
      await this.updateAccount(userId, accountId, {
        lastSyncedAt: new Date(),
        syncStatus: SyncStatus.ACTIVE,
      });

      // Update sync log
      await pool.query(
        `
        UPDATE sync_logs 
        SET status = 'SUCCESS', 
            completed_at = CURRENT_TIMESTAMP,
            duration_ms = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) * 1000,
            transactions_fetched = $1,
            transactions_created = $2
        WHERE id = $3
        `,
        [transactionsFetched, transactionsCreated, syncLogId]
      );

      return {
        success: true,
        transactionsFetched,
        transactionsCreated,
      };
    } catch (error: any) {
      // Update sync log with error
      await pool.query(
        `
        UPDATE sync_logs 
        SET status = 'FAILED', 
            completed_at = CURRENT_TIMESTAMP,
            duration_ms = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) * 1000,
            error_message = $1
        WHERE id = $2
        `,
        [error.message, syncLogId]
      );

      // Update account status
      await this.updateAccount(userId, accountId, {
        syncStatus: SyncStatus.FAILED,
      });

      throw error;
    }
  }

  static async getSyncLogs(userId: string, accountId?: string) {
    let query = 'SELECT * FROM sync_logs WHERE user_id = $1';
    const values: any[] = [userId];

    if (accountId) {
      query += ' AND linked_account_id = $2';
      values.push(accountId);
    }

    query += ' ORDER BY started_at DESC LIMIT 50';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getAccountSummary(userId: string) {
    const query = `
      SELECT 
        COUNT(*) as total_accounts,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_accounts,
        COUNT(CASE WHEN sync_status = 'ACTIVE' THEN 1 END) as synced_accounts,
        COUNT(CASE WHEN sync_status = 'FAILED' THEN 1 END) as failed_accounts,
        COALESCE(SUM(account_balance), 0) as total_balance
      FROM linked_accounts
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}
