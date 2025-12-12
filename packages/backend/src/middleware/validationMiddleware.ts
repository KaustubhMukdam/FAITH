import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ErrorCodes } from '@faith/shared';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Validation failed',
          details: error.errors,
          statusCode: 400,
        },
      });
    }
  };
};
