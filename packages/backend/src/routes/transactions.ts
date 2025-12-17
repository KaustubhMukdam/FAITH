import { Router } from 'express';
import pool from '../config/database';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all transactions
router.get('/', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate, type, category } = req.query;

    let query = 'SELECT * FROM transactions WHERE user_id = $1';
    const params: any[] = [userId];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      query += ` AND transaction_date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND transaction_date <= $${paramCount}`;
      params.push(endDate);
    }

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    query += ' ORDER BY transaction_date DESC, created_at DESC';

    const result = await pool.query(query, params);
    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction summary
router.get('/summary', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // Get total income
    const incomeResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = $2',
      [userId, 'income']
    );

    // Get total expense
    const expenseResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = $1 AND type = $2',
      [userId, 'expense']
    );

    // Get category breakdown
    const categoryResult = await pool.query(
      `SELECT category, SUM(amount) as total,
       ROUND((SUM(amount) * 100.0 / NULLIF((SELECT SUM(amount) FROM transactions WHERE user_id = $1 AND type = 'expense'), 0)), 2) as percentage
       FROM transactions
       WHERE user_id = $1 AND type = 'expense'
       GROUP BY category
       ORDER BY total DESC`,
      [userId]
    );

    const totalIncome = parseFloat(incomeResult.rows[0].total);
    const totalExpense = parseFloat(expenseResult.rows[0].total);
    const netBalance = totalIncome - totalExpense;

    res.json({
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
        categoryBreakdown: categoryResult.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    res.status(500).json({ error: 'Failed to fetch transaction summary' });
  }
});

// Create transaction
router.post('/', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { type, amount, category, description, transaction_date } = req.body;

    if (!type || !amount || !category || !description || !transaction_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, category, description, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, type, amount, category, description, transaction_date]
    );

    res.status(201).json({ transaction: result.rows[0] });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default router;
