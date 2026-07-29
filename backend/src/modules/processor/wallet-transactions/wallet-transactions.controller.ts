import { Request, Response, NextFunction } from 'express';
import {
  ProcessorWalletTransactionsService,
  processorWalletTransactionsService,
} from './wallet-transactions.service.js';

export class ProcessorWalletTransactionsController {
  constructor(
    private service: ProcessorWalletTransactionsService = processorWalletTransactionsService
  ) {}

  getTransactionHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const identifier =
        req.params.id || (req as any).user?.id || 'demo-processor-id';
      const search = (req.query.search as string) || '';
      const filter = (req.query.filter as string) || 'ALL';

      const result = await this.service.getTransactionHistory(
        identifier,
        search,
        filter
      );
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.message.includes('not found') ? 404 : 400).json({
        success: false,
        message: error.message || 'Failed to retrieve wallet transactions history',
      });
    }
  };

  getTransactionById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const identifier = (req as any).user?.id || req.query.processorId || 'demo-processor-id';
      const transactionId = req.params.transactionId || req.params.id;

      if (!transactionId) {
        res.status(400).json({ success: false, message: 'Transaction ID is required' });
        return;
      }

      const transaction = await this.service.getTransactionById(
        identifier as string,
        transactionId
      );

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Transaction details not found',
      });
    }
  };
}

export const processorWalletTransactionsController =
  new ProcessorWalletTransactionsController();
