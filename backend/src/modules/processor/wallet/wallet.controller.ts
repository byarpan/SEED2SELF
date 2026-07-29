import { Request, Response, NextFunction } from 'express';
import { ProcessorWalletService, processorWalletService } from './wallet.service.js';

export class ProcessorWalletController {
  constructor(private service: ProcessorWalletService = processorWalletService) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.params.id || (req as any).user?.id || 'demo-processor-id';
      const timeframe = (req.query.timeframe as any) || 'MONTHLY';
      const dashboard = await this.service.getWalletDashboard(identifier, timeframe);
      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error: any) {
      res.status(error.message.includes('not found') ? 404 : 400).json({
        success: false,
        message: error.message || 'Failed to fetch wallet dashboard',
      });
    }
  };

  getBankAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.params.id || (req as any).user?.id || 'demo-processor-id';
      const bankAccount = await this.service.getBankAccount(identifier);
      res.status(200).json({
        success: true,
        data: bankAccount,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch bank account details',
      });
    }
  };

  updateBankAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.params.id || (req as any).user?.id || 'demo-processor-id';
      const bankAccount = await this.service.updateBankAccount(identifier, req.body);
      res.status(200).json({
        success: true,
        message: 'Corporate bank account details saved & verified successfully!',
        data: bankAccount,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to save bank account details',
      });
    }
  };

  getEscrowDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.params.id || (req as any).user?.id || 'demo-processor-id';
      const escrowDetails = await this.service.getEscrowDetails(identifier);
      res.status(200).json({
        success: true,
        data: escrowDetails,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch escrow details',
      });
    }
  };

  addEscrowItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.params.id || (req as any).user?.id || 'demo-processor-id';
      const escrowItem = await this.service.addEscrowItem(identifier, req.body);
      res.status(201).json({
        success: true,
        message: 'Escrow item added successfully',
        data: escrowItem,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add escrow item',
      });
    }
  };

  getProductAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.params.id || (req as any).user?.id || 'demo-processor-id';
      const analytics = await this.service.getProductAnalytics(identifier);
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch product analytics',
      });
    }
  };

  getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.params.id || (req as any).user?.id || 'demo-processor-id';
      const transactions = await this.service.getTransactions(identifier);
      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch transaction logs',
      });
    }
  };

  addTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.params.id || (req as any).user?.id || 'demo-processor-id';
      const transaction = await this.service.addTransaction(identifier, req.body);
      res.status(201).json({
        success: true,
        message: 'Transaction logged successfully',
        data: transaction,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to log transaction',
      });
    }
  };
}

export const processorWalletController = new ProcessorWalletController();
