import * as jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRY || '7d';
  
  return jwt.sign({ userId }, secret, { expiresIn });
};

export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET!;
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRY || '30d';
  
  return jwt.sign({ userId }, secret, { expiresIn });
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
};
