import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/token=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid Bearer token.',
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
    const decoded = jwt.verify(token, jwtSecret) as any;

    if (!decoded || !decoded.id) {
      res.status(401).json({
        success: false,
        message: 'Invalid token payload',
      });
      return;
    }

    // Resolve user from MongoDB Atlas
    const user = await User.findById(decoded.id).exec();
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User associated with token no longer exists in database',
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      userId: user.userId,
      farmerId: user.farmerId,
      processorId: user.processorId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verificationStatus: user.verificationStatus,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid or malformed authentication token',
    });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized access',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles. Your role is '${req.user.role}'.`,
      });
      return;
    }

    next();
  };
};
