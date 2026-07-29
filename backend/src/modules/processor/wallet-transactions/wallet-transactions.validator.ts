import { Request, Response, NextFunction } from 'express';

export class ProcessorWalletTransactionsValidator {
  static validateQueryParams(req: Request, res: Response, next: NextFunction): void {
    const filter = req.query.filter as string;
    if (
      filter &&
      !['ALL', 'BANK_CREDITS', 'BANK_DEBITS', 'ESCROW_LOCKS'].includes(
        filter.toUpperCase()
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          'Invalid filter parameter. Must be ALL, BANK_CREDITS, BANK_DEBITS, or ESCROW_LOCKS.',
      });
      return;
    }

    next();
  }
}
