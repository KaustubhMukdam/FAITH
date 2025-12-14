import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { UserCreateSchema } from '@faith/shared';
import { ErrorCodes } from '@faith/shared';
import logger from '../config/logger';
import redis from '../config/redis';
import { AuthRequest } from '../middleware/authMiddleware';

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate input
      const validatedData = UserCreateSchema.parse(req.body);

      // Create user
      const user = await UserService.createUser(validatedData);

      // Generate tokens
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Store refresh token in Redis (30 days)
      await redis.setex(`refresh_token:${user.id}`, 30 * 24 * 60 * 60, refreshToken);

      logger.info(`User registered successfully: ${user.email}`);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            kycStatus: user.kycStatus,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        message: 'User registered successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error.errors) {
        // Zod validation error
        res.status(400).json({
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Validation failed',
            details: error.errors,
            statusCode: 400,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      next(error);
    }
  }

  // Login user
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Email and password are required',
            statusCode: 400,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify credentials
      const user = await UserService.verifyPassword(email, password);

      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: ErrorCodes.INVALID_CREDENTIALS,
            message: 'Invalid email or password',
            statusCode: 401,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate tokens
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Store refresh token in Redis
      await redis.setex(`refresh_token:${user.id}`, 30 * 24 * 60 * 60, refreshToken);

      // Update last login
      await UserService.updateLastLogin(user.id);

      logger.info(`User logged in: ${user.email}`);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            kycStatus: user.kycStatus,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        message: 'Login successful',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh access token
  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Refresh token is required',
            statusCode: 400,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify refresh token
      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch (error) {
        res.status(403).json({
          success: false,
          error: {
            code: ErrorCodes.INVALID_TOKEN,
            message: 'Invalid or expired refresh token',
            statusCode: 403,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if token exists in Redis
      const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

      if (!storedToken || storedToken !== refreshToken) {
        res.status(403).json({
          success: false,
          error: {
            code: ErrorCodes.INVALID_TOKEN,
            message: 'Refresh token not found or revoked',
            statusCode: 403,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(decoded.userId);

      logger.info(`Token refreshed for user: ${decoded.userId}`);

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
        },
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user
  static async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;

      const user = await UserService.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: ErrorCodes.USER_NOT_FOUND,
            message: 'User not found',
            statusCode: 404,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            kycStatus: user.kycStatus,
            preferences: user.preferences,
            createdAt: user.createdAt,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout user
  static async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;

      // Remove refresh token from Redis
      await redis.del(`refresh_token:${userId}`);

      logger.info(`User logged out: ${userId}`);

      res.json({
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
