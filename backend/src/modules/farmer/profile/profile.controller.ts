import { Request, Response, NextFunction } from 'express';
import { ProfileService, profileService } from './profile.service.js';
import { ProfileValidator } from './profile.validator.js';

export class ProfileController {
  constructor(private service: ProfileService = profileService) {}

  registerFarmer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = ProfileValidator.validateRegistration(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const result = await this.service.registerFarmer(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId || req.params.id;

      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID or Farmer ID is required' });
        return;
      }

      const profile = await this.service.getProfile(userId as string);
      res.status(200).json({
        success: true,
        message: 'Farmer profile retrieved successfully from MongoDB Atlas',
        data: profile,
      });
    } catch (error: any) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId || req.params.userId || req.params.id;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const validation = ProfileValidator.validateProfileUpdate(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const updatedUser = await this.service.updateProfile(userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully in MongoDB Atlas',
        data: updatedUser,
      });
    } catch (error: any) {
      next(error);
    }
  };

  updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId || req.params.userId || req.params.id;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const validation = ProfileValidator.validateAddressUpdate(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const updatedAddress = await this.service.updateAddress(userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Address saved to addresses collection in MongoDB Atlas',
        data: updatedAddress,
      });
    } catch (error: any) {
      next(error);
    }
  };

  updateKYC = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId || req.params.userId || req.params.id;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const validation = ProfileValidator.validateKYCUpdate(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const updatedKYC = await this.service.updateKYC(userId, req.body);
      res.status(200).json({
        success: true,
        message: 'KYC documents saved to kycs collection in MongoDB Atlas',
        data: updatedKYC,
      });
    } catch (error: any) {
      next(error);
    }
  };

  updateBankAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId || req.params.userId || req.params.id;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const validation = ProfileValidator.validateBankAccount(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const updatedBank = await this.service.updateBankAccount(userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Bank account details saved to bankaccounts collection in MongoDB Atlas',
        data: updatedBank,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getBankAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId || req.params.id;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const bankAccount = await this.service.getBankAccount(userId as string);
      res.status(200).json({
        success: true,
        message: 'Bank account details retrieved from MongoDB Atlas',
        data: bankAccount,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getNotificationSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId || req.params.id;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const settings = await this.service.getNotificationSettings(userId as string);
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      next(error);
    }
  };

  updateNotificationSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId || req.params.userId || req.params.id;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const updated = await this.service.updateNotificationSettings(userId, req.body);
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export const profileController = new ProfileController();
