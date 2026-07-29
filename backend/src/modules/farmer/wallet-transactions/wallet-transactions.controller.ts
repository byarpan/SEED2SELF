import { Request, Response, NextFunction } from 'express';
import { WalletTransactionsService, walletTransactionsService } from './wallet-transactions.service.js';
import { WalletTransactionsValidator } from './wallet-transactions.validator.js';
import { TransactionFilterType } from './dto/wallet-transactions.dto.js';

export class WalletTransactionsController {
  constructor(private service: WalletTransactionsService = walletTransactionsService) {}

  getTransactionHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const queryDto = {
        search: req.query.search as string,
        filter: (req.query.filter as TransactionFilterType) || 'ALL',
      };

      const validation = WalletTransactionsValidator.validateQuery(queryDto);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const transactions = await this.service.getTransactionHistory(userId as string, queryDto);
      res.status(200).json({
        success: true,
        message: 'Wallet transaction history retrieved successfully',
        data: transactions,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getTransactionDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      if (!id) {
        res.status(400).json({ success: false, message: 'Transaction or Order ID is required' });
        return;
      }

      const details = await this.service.getTransactionDetails(userId as string, id);
      res.status(200).json({
        success: true,
        message: 'Transaction details retrieved successfully',
        data: details,
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export const walletTransactionsController = new WalletTransactionsController();
