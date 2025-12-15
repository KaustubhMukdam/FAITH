import pool from '../config/database';
import { 
  TransactionCategory, 
  PaymentMode 
} from '../models/Transaction';

interface TransactionInput {
  type: 'INCOME' | 'EXPENSE';
  category: TransactionCategory;
  amount: number;
  description?: string;
  paymentMode?: PaymentMode;
  date?: Date;
  merchant?: string;
  notes?: string;
  tags?: string[];
  location?: string;
}

interface TransactionFilters {
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export class TransactionService {
  static async createTransaction(userId: string, data: TransactionInput) {
    const {
      type: inputType,
      category,
      amount,
      description,
      paymentMode,
      date,
      merchant,
      notes,
      tags,
      location,
    } = data;

    const dbType = inputType === 'INCOME' ? 'CREDIT' : 'DEBIT';

    const metadata: any = {};
    if (paymentMode) metadata.paymentMode = paymentMode;
    if (notes) metadata.notes = notes;
    if (tags) metadata.tags = tags;
    if (location) metadata.location = location;

    const query = `
      INSERT INTO transactions (
        user_id, type, category, amount, description, merchant, 
        source, timestamp, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *, 
        CASE 
          WHEN type = 'CREDIT' THEN 'INCOME'
          WHEN type = 'DEBIT' THEN 'EXPENSE'
        END as api_type
    `;

    const values = [
      userId,
      dbType,
      category,
      amount,
      description || '',
      merchant || '',
      'MANUAL_ENTRY',
      date || new Date(),
      JSON.stringify(metadata),
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    return {
      ...row,
      type: row.api_type,
    };
  }

  static async getTransactions(userId: string, filters: TransactionFilters) {
    const {
      type: inputType,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const conditions: string[] = ['user_id = $1'];
    const values: any[] = [userId];
    let paramCount = 1;

    if (inputType) {
      const dbType = inputType === 'INCOME' ? 'CREDIT' : 'DEBIT';
      paramCount++;
      conditions.push(`type = $${paramCount}`);
      values.push(dbType);
    }

    if (category) {
      paramCount++;
      conditions.push(`category = $${paramCount}`);
      values.push(category);
    }

    if (startDate) {
      paramCount++;
      conditions.push(`timestamp >= $${paramCount}`);
      values.push(startDate);
    }

    if (endDate) {
      paramCount++;
      conditions.push(`timestamp <= $${paramCount}`);
      values.push(endDate);
    }

    if (minAmount !== undefined) {
      paramCount++;
      conditions.push(`amount >= $${paramCount}`);
      values.push(minAmount);
    }

    if (maxAmount !== undefined) {
      paramCount++;
      conditions.push(`amount <= $${paramCount}`);
      values.push(maxAmount);
    }

    if (search) {
      paramCount++;
      conditions.push(`(description ILIKE $${paramCount} OR merchant ILIKE $${paramCount})`);
      values.push(`%${search}%`);
    }

    const whereClause = conditions.join(' AND ');

    const countQuery = `SELECT COUNT(*) FROM transactions WHERE ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    const dataQuery = `
      SELECT *, 
        CASE 
          WHEN type = 'CREDIT' THEN 'INCOME'
          WHEN type = 'DEBIT' THEN 'EXPENSE'
        END as api_type
      FROM transactions 
      WHERE ${whereClause}
      ORDER BY timestamp DESC, created_at DESC 
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    values.push(limit, (page - 1) * limit);
    const result = await pool.query(dataQuery, values);
    
    const transactions = result.rows.map(row => ({
      ...row,
      type: row.api_type,
    }));

    return {
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getTransactionById(userId: string, transactionId: string) {
    const query = `
      SELECT *, 
        CASE 
          WHEN type = 'CREDIT' THEN 'INCOME'
          WHEN type = 'DEBIT' THEN 'EXPENSE'
        END as api_type
      FROM transactions 
      WHERE id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [transactionId, userId]);

    if (result.rows.length === 0) {
      throw new Error('Transaction not found');
    }

    const row = result.rows[0];
    return {
      ...row,
      type: row.api_type,
    };
  }

  static async updateTransaction(
    userId: string,
    transactionId: string,
    data: Partial<TransactionInput>
  ) {
    const existing = await this.getTransactionById(userId, transactionId);

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (data.type) {
      const dbType = data.type === 'INCOME' ? 'CREDIT' : 'DEBIT';
      paramCount++;
      fields.push(`type = $${paramCount}`);
      values.push(dbType);
    }

    const directFields: Record<string, string> = {
      category: 'category',
      amount: 'amount',
      description: 'description',
      merchant: 'merchant',
      date: 'timestamp',
    };

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && directFields[key]) {
        paramCount++;
        fields.push(`${directFields[key]} = $${paramCount}`);
        values.push(value);
      }
    });

    const metadataFields = ['paymentMode', 'notes', 'tags', 'location'];
    const hasMetadataUpdate = metadataFields.some(field => data[field as keyof TransactionInput] !== undefined);
    
    if (hasMetadataUpdate) {
      const currentMetadata = existing.metadata || {};
      const newMetadata = { ...currentMetadata };
      
      metadataFields.forEach(field => {
        const value = data[field as keyof TransactionInput];
        if (value !== undefined) {
          newMetadata[field] = value;
        }
      });
      
      paramCount++;
      fields.push(`metadata = $${paramCount}`);
      values.push(JSON.stringify(newMetadata));
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    paramCount++;
    values.push(transactionId);
    paramCount++;
    values.push(userId);

    const query = `
      UPDATE transactions 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
      RETURNING *, 
        CASE 
          WHEN type = 'CREDIT' THEN 'INCOME'
          WHEN type = 'DEBIT' THEN 'EXPENSE'
        END as api_type
    `;

    const result = await pool.query(query, values);
    const row = result.rows[0];
    return {
      ...row,
      type: row.api_type,
    };
  }

  static async deleteTransaction(userId: string, transactionId: string) {
    await this.getTransactionById(userId, transactionId);
    const query = 'DELETE FROM transactions WHERE id = $1 AND user_id = $2';
    await pool.query(query, [transactionId, userId]);
  }

  static async getTransactionSummary(
    userId: string,
    startDate?: string,
    endDate?: string
  ) {
    let dateFilter = '';
    const values: any[] = [userId];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      dateFilter += ` AND timestamp >= $${paramCount}`;
      values.push(startDate);
    }

    if (endDate) {
      paramCount++;
      dateFilter += ` AND timestamp <= $${paramCount}`;
      values.push(endDate);
    }

    const totalsQuery = `
      SELECT 
        CASE 
          WHEN type = 'CREDIT' THEN 'INCOME'
          WHEN type = 'DEBIT' THEN 'EXPENSE'
        END as api_type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions
      WHERE user_id = $1 ${dateFilter}
      GROUP BY type
    `;
    const totalsResult = await pool.query(totalsQuery, values);

    const summary: any = {
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
      transactionCount: 0,
    };

    totalsResult.rows.forEach((row) => {
      if (row.api_type === 'INCOME') {
        summary.totalIncome = parseFloat(row.total);
      } else if (row.api_type === 'EXPENSE') {
        summary.totalExpense = parseFloat(row.total);
      }
      summary.transactionCount += parseInt(row.count);
    });

    summary.netBalance = summary.totalIncome - summary.totalExpense;

    const categoryQuery = `
      SELECT 
        category,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions
      WHERE user_id = $1 AND type = 'DEBIT' ${dateFilter}
      GROUP BY category
      ORDER BY total DESC
    `;
    const categoryResult = await pool.query(categoryQuery, values);

    summary.categoryBreakdown = categoryResult.rows.map((row) => ({
      category: row.category,
      total: parseFloat(row.total),
      count: parseInt(row.count),
      percentage:
        summary.totalExpense > 0
          ? (parseFloat(row.total) / summary.totalExpense) * 100
          : 0,
    }));

    const trendQuery = `
      SELECT 
        TO_CHAR(timestamp, 'YYYY-MM') as month,
        CASE 
          WHEN type = 'CREDIT' THEN 'INCOME'
          WHEN type = 'DEBIT' THEN 'EXPENSE'
        END as api_type,
        SUM(amount) as total
      FROM transactions
      WHERE user_id = $1 ${dateFilter}
      GROUP BY month, type
      ORDER BY month DESC
      LIMIT 12
    `;
    const trendResult = await pool.query(trendQuery, values);

    const trendMap = new Map();
    trendResult.rows.forEach((row) => {
      if (!trendMap.has(row.month)) {
        trendMap.set(row.month, { month: row.month, income: 0, expense: 0 });
      }
      const trend = trendMap.get(row.month);
      if (row.api_type === 'INCOME') {
        trend.income = parseFloat(row.total);
      } else if (row.api_type === 'EXPENSE') {
        trend.expense = parseFloat(row.total);
      }
    });

    summary.monthlyTrend = Array.from(trendMap.values());

    return summary;
  }

  static getCategories() {
    return {
      income: [
        'SALARY',
        'FREELANCE',
        'INVESTMENT',
        'BUSINESS',
        'GIFT',
        'OTHER_INCOME',
      ],
      expense: [
        'FOOD',
        'TRANSPORTATION',
        'SHOPPING',
        'ENTERTAINMENT',
        'BILLS',
        'HEALTHCARE',
        'EDUCATION',
        'TRAVEL',
        'GROCERIES',
        'RENT',
        'EMI',
        'INSURANCE',
        'INVESTMENT_EXPENSE',
        'OTHER_EXPENSE',
      ],
    };
  }
}
