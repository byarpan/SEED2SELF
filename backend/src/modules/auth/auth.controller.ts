import { Request, Response, NextFunction } from 'express';
import { AuthService, authService } from './auth.service.js';
import { AuthenticatedRequest } from '../../shared/middleware/auth.middleware.js';

export class AuthController {
  constructor(private service: AuthService = authService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.register(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully on MongoDB Atlas',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Authentication failed',
      });
    }
  };

  me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const user = await this.service.getCurrentUser(userId);
      res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully from MongoDB Atlas',
        data: user,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'User profile not found',
      });
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Please clear your token from client storage.',
    });
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { identifier } = req.body;
      if (!identifier) {
        res.status(400).json({ success: false, message: 'Identifier is required for token refresh' });
        return;
      }
      const result = await this.service.login({ identifier });
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Refresh token failed',
      });
    }
  };
}

export const authController = new AuthController();
