import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorCodes } from '@faith/shared';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: ErrorCodes.UNAUTHORIZED,
        message: 'Access token required',
        statusCode: 401,
      },
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: {
        code: ErrorCodes.INVALID_TOKEN,
        message: 'Invalid or expired token',
        statusCode: 403,
      },
    });
  }
};
