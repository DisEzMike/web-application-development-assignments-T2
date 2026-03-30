// Middleware for authentication (placeholder)
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../utils/contants';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded; // Attach user info to request
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
  next();
};