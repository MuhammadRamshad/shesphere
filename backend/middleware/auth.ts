// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../../src/types'; // Import your user interface

// Extend the Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Main authentication middleware
export const authenticateUser = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Get token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login.' 
      });
    }

    // Verify the token using your JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
      role: string;
    };
    
    // Attach the user info to the request
    // In a real application, you might want to fetch the complete user from your database
    req.user = {
      _id: decoded.id,
      email: decoded.email,
      role: decoded.role
    } as IUser;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token. Please login again.' 
    });
  }
};

// Optional: Role-based authorization middleware
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    
    next();
  };
};