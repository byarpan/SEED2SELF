import { Request, Response, NextFunction } from 'express';

export class ProcessorInvoicesValidator {
  static validateQuery(req: Request, res: Response, next: NextFunction): void {
    const category = req.query.category as string;
    if (category && !['ALL', 'SALES', 'PURCHASE'].includes(category.toUpperCase())) {
      res.status(400).json({
        success: false,
        message: 'Invalid invoice category. Must be ALL, SALES, or PURCHASE.',
      });
      return;
    }
    next();
  }
}
