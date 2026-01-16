import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = (req as any).headers['authorization'];
  const token = authHeader && typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined; // Bearer <token>

  if (!token) {
    return (res as any).status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; role: string };
    req.user = decoded;
    next();
  } catch (err) {
    return (res as any).status(403).json({ message: 'Invalid or expired token' });
  }
};