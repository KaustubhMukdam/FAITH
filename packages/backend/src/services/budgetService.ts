import pool from '../config/database';
import { BudgetCategory } from '../models/Budget';

interface BudgetInput {
  month: string; // YYYY-MM
  totalAmount: number;
  rolloverEnabled?: boolean;
  allocations: {
    category: BudgetCategory;
    allocatedAmount: number;
    alertThreshold?: number;
    rolloverPercentage?: number;
  }[];
}

export class BudgetService {
  static async createBudget(userId: string, data: BudgetInput) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const { month, totalAmount, rolloverEnabled = true, allocations } = data;

      // Create budget
      const budgetQuery = `
        INSERT INTO budgets (user_id, month, total_amount, rollover_enabled)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const budgetResult = await client.query(budgetQuery, [
        userId,
        month,
        totalAmount,
        rolloverEnabled,
      ]);
      const budget = budgetResult.rows[0];

      // Create allocations
      const allocationPromises = allocations.map(async (alloc) => {
        const allocQuery = `
          INSERT INTO budget_allocations (
            budget_id, category, allocated_amount, 
            alert_threshold, rollover_percentage
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        const result = await client.query(allocQuery, [
          budget.id,
          alloc.category,
          alloc.allocatedAmount,
          alloc.alertThreshold || 85,
          alloc.rolloverPercentage || 0,
        ]);
        return result.rows[0];
      });

      const allocationResults = await Promise.all(allocationPromises);

      await client.query('COMMIT');

      return {
        ...budget,
        allocations: allocationResults,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getBudgetByMonth(userId: string, month: string) {
    const query = `
      SELECT 
        b.*,
        json_agg(
          json_build_object(
            'id', ba.id,
            'category', ba.category,
            'allocatedAmount', ba.allocated_amount,
            'spentAmount', ba.spent_amount,
            'alertThreshold', ba.alert_threshold,
            'rolloverPercentage', ba.rollover_percentage
          )
        ) as allocations
      FROM budgets b
      LEFT JOIN budget_allocations ba ON ba.budget_id = b.id
      WHERE b.user_id = $1 AND b.month = $2
      GROUP BY b.id
    `;

    const result = await pool.query(query, [userId, month]);
    
    if (result.rows.length === 0) {
      throw new Error('Budget not found for this month');
    }

    return result.rows[0];
  }

  static async getAllBudgets(userId: string) {
    const query = `
      SELECT 
        b.*,
        json_agg(
          json_build_object(
            'id', ba.id,
            'category', ba.category,
            'allocatedAmount', ba.allocated_amount,
            'spentAmount', ba.spent_amount,
            'alertThreshold', ba.alert_threshold,
            'rolloverPercentage', ba.rollover_percentage
          )
        ) as allocations
      FROM budgets b
      LEFT JOIN budget_allocations ba ON ba.budget_id = b.id
      WHERE b.user_id = $1
      GROUP BY b.id
      ORDER BY b.month DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async getBudgetSpending(userId: string, month: string) {
    const query = `
      SELECT * FROM budget_spending_summary
      WHERE user_id = $1 AND month = $2
      ORDER BY category
    `;

    const result = await pool.query(query, [userId, month]);
    return result.rows;
  }

  static async updateBudgetAllocation(
    userId: string,
    allocationId: string,
    data: { allocatedAmount?: number; alertThreshold?: number }
  ) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (data.allocatedAmount !== undefined) {
      paramCount++;
      fields.push(`allocated_amount = $${paramCount}`);
      values.push(data.allocatedAmount);
    }

    if (data.alertThreshold !== undefined) {
      paramCount++;
      fields.push(`alert_threshold = $${paramCount}`);
      values.push(data.alertThreshold);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    paramCount++;
    values.push(allocationId);
    paramCount++;
    values.push(userId);

    const query = `
      UPDATE budget_allocations ba
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      FROM budgets b
      WHERE ba.id = $${paramCount - 1} 
        AND ba.budget_id = b.id 
        AND b.user_id = $${paramCount}
      RETURNING ba.*
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Budget allocation not found');
    }

    return result.rows[0];
  }

  static async getBudgetAlerts(userId: string, month?: string) {
    let query = `
      SELECT 
        budget_id,
        month,
        category,
        allocated_amount,
        actual_spent,
        spent_percentage,
        status
      FROM budget_spending_summary
      WHERE user_id = $1 
        AND status IN ('WARNING', 'EXCEEDED')
    `;

    const values: any[] = [userId];

    if (month) {
      query += ' AND month = $2';
      values.push(month);
    }

    query += ' ORDER BY spent_percentage DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getBudgetSummary(userId: string, month: string) {
    const query = `
      SELECT 
        month,
        SUM(allocated_amount) as total_allocated,
        SUM(actual_spent) as total_spent,
        SUM(remaining_amount) as total_remaining,
        ROUND(AVG(spent_percentage), 2) as avg_spent_percentage,
        COUNT(CASE WHEN status = 'EXCEEDED' THEN 1 END) as exceeded_count,
        COUNT(CASE WHEN status = 'WARNING' THEN 1 END) as warning_count,
        COUNT(CASE WHEN status = 'OK' THEN 1 END) as on_track_count
      FROM budget_spending_summary
      WHERE user_id = $1 AND month = $2
      GROUP BY month
    `;

    const result = await pool.query(query, [userId, month]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  static async deleteBudget(userId: string, month: string) {
    const query = `
      DELETE FROM budgets 
      WHERE user_id = $1 AND month = $2
      RETURNING *
    `;

    const result = await pool.query(query, [userId, month]);
    
    if (result.rows.length === 0) {
      throw new Error('Budget not found');
    }

    return result.rows[0];
  }
}
