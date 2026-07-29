import { Request, Response, NextFunction } from 'express';
import { WalletService, walletService } from './wallet.service.js';
import { WalletValidator } from './wallet.validator.js';

export class WalletController {
  constructor(private service: WalletService = walletService) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const dashboard = await this.service.getDashboard(userId as string);
      res.status(200).json({
        success: true,
        message: 'Wallet dashboard retrieved successfully',
        data: dashboard,
      });
    } catch (error: any) {
      next(error);
    }
  };

  withdrawFunds = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId;
      const { amount } = req.body;

      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const result = await this.service.withdrawFunds(userId as string, Number(amount));
      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getBankAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const bankAccount = await this.service.getBankAccount(userId as string);
      res.status(200).json({
        success: true,
        message: 'Bank account retrieved successfully',
        data: bankAccount,
      });
    } catch (error: any) {
      next(error);
    }
  };

  updateBankAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const validation = WalletValidator.validateBankAccount(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const updatedAccount = await this.service.updateBankAccount(userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Connected bank account updated successfully',
        data: updatedAccount,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getFinancialSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const summary = await this.service.getFinancialSummary(userId as string);
      res.status(200).json({
        success: true,
        message: 'Financial summary retrieved successfully',
        data: summary,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getEscrowDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const escrowDetails = await this.service.getEscrowDetails(userId as string);
      res.status(200).json({
        success: true,
        message: 'Escrow details retrieved successfully',
        data: escrowDetails,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getCropAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const analytics = await this.service.getCropRevenueAnalytics(userId as string);
      res.status(200).json({
        success: true,
        message: 'Crop revenue analytics retrieved successfully',
        data: analytics,
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export const walletController = new WalletController();
