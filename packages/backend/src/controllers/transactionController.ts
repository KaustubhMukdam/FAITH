import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transactionService';
import { AuthRequest } from '../middleware/authMiddleware';

export class TransactionController {
  static async createTransaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const transaction = await TransactionService.createTransaction(userId, req.body);
      
      res.status(201).json({
        success: true,
        data: { transaction },
        message: 'Transaction created successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const filters = {
        type: req.query.type as string,
        category: req.query.category as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const result = await TransactionService.getTransactions(userId, filters);
      
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const transactionId = req.params.id;
      
      const transaction = await TransactionService.getTransactionById(userId, transactionId);
      
      res.json({
        success: true,
        data: { transaction },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTransaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const transactionId = req.params.id;
      
      const transaction = await TransactionService.updateTransaction(
        userId,
        transactionId,
        req.body
      );
      
      res.json({
        success: true,
        data: { transaction },
        message: 'Transaction updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTransaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const transactionId = req.params.id;
      
      await TransactionService.deleteTransaction(userId, transactionId);
      
      res.json({
        success: true,
        message: 'Transaction deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      const summary = await TransactionService.getTransactionSummary(
        userId,
        startDate,
        endDate
      );
      
      res.json({
        success: true,
        data: { summary },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = TransactionService.getCategories();
      
      res.json({
        success: true,
        data: { categories },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
