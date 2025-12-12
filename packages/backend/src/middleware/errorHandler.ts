import { Request, Response, NextFunction } from 'express';
import { ErrorCodes } from '@faith/shared';
import logger from '../config/logger';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || ErrorCodes.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      statusCode,
    },
    timestamp: new Date().toISOString(),
  });
};
