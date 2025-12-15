import { Response, NextFunction } from 'express';
import { BudgetService } from '../services/budgetService';
import { AuthRequest } from '../middleware/authMiddleware';

export class BudgetController {
  static async createBudget(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const budget = await BudgetService.createBudget(userId, req.body);
      
      res.status(201).json({
        success: true,
        data: { budget },
        message: 'Budget created successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(409).json({
          success: false,
          error: {
            message: 'Budget already exists for this month',
            code: 'BUDGET_EXISTS',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      next(error);
    }
  }

  static async getBudgetByMonth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const month = req.params.month;
      
      const budget = await BudgetService.getBudgetByMonth(userId, month);
      
      res.json({
        success: true,
        data: { budget },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllBudgets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const budgets = await BudgetService.getAllBudgets(userId);
      
      res.json({
        success: true,
        data: { budgets, total: budgets.length },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBudgetSpending(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const month = req.params.month;
      
      const spending = await BudgetService.getBudgetSpending(userId, month);
      
      res.json({
        success: true,
        data: { spending },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateBudgetAllocation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const allocationId = req.params.allocationId;
      
      const allocation = await BudgetService.updateBudgetAllocation(
        userId,
        allocationId,
        req.body
      );
      
      res.json({
        success: true,
        data: { allocation },
        message: 'Budget allocation updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBudgetAlerts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const month = req.query.month as string;
      
      const alerts = await BudgetService.getBudgetAlerts(userId, month);
      
      res.json({
        success: true,
        data: { alerts, count: alerts.length },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBudgetSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const month = req.params.month;
      
      const summary = await BudgetService.getBudgetSummary(userId, month);
      
      if (!summary) {
        res.status(404).json({
          success: false,
          error: {
            message: 'No budget found for this month',
            code: 'BUDGET_NOT_FOUND',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      
      res.json({
        success: true,
        data: { summary },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteBudget(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const month = req.params.month;
      
      await BudgetService.deleteBudget(userId, month);
      
      res.json({
        success: true,
        message: 'Budget deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
