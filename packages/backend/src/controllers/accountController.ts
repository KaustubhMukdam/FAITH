import { Response, NextFunction } from 'express';
import { AccountService } from '../services/accountService';
import { SMSParserService } from '../services/smsParserService';
import { AuthRequest } from '../middleware/authMiddleware';

export class AccountController {
  static async linkAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const account = await AccountService.linkAccount(userId, req.body);
      
      res.status(201).json({
        success: true,
        data: { account },
        message: 'Account linked successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLinkedAccounts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const includeInactive = req.query.includeInactive === 'true';
      
      const accounts = await AccountService.getLinkedAccounts(userId, includeInactive);
      
      res.json({
        success: true,
        data: { accounts, total: accounts.length },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAccountById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const accountId = req.params.id;
      
      const account = await AccountService.getAccountById(userId, accountId);
      
      res.json({
        success: true,
        data: { account },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const accountId = req.params.id;
      
      const account = await AccountService.updateAccount(userId, accountId, req.body);
      
      res.json({
        success: true,
        data: { account },
        message: 'Account updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const accountId = req.params.id;
      
      await AccountService.deleteAccount(userId, accountId);
      
      res.json({
        success: true,
        message: 'Account deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async syncAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const accountId = req.params.id;
      
      const result = await AccountService.syncAccount(userId, accountId);
      
      res.json({
        success: true,
        data: result,
        message: 'Account synced successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSyncLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const accountId = req.query.accountId as string;
      
      const logs = await AccountService.getSyncLogs(userId, accountId);
      
      res.json({
        success: true,
        data: { logs, total: logs.length },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAccountSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const summary = await AccountService.getAccountSummary(userId);
      
      res.json({
        success: true,
        data: { summary },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // SMS Parser endpoints
  static async parseSMS(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { message, sender, timestamp } = req.body;
      
      const parsed = await SMSParserService.parseSMS(userId, {
        message,
        sender,
        timestamp: new Date(timestamp),
      });
      
      if (!parsed) {
        res.json({
          success: true,
          data: { parsed: null },
          message: 'SMS is not a transaction message',
          timestamp: new Date().toISOString(),
        });
        return;
      }
      
      res.json({
        success: true,
        data: { parsed },
        message: 'SMS parsed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUnprocessedSMS(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const smsTransactions = await SMSParserService.getUnprocessedSMS(userId);
      
      res.json({
        success: true,
        data: { smsTransactions, total: smsTransactions.length },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
