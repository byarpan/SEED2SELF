import { Request, Response, NextFunction } from 'express';

export class ReportsValidator {
  static validateTimeframeQuery(req: Request, res: Response, next: NextFunction): void {
    const timeframe = req.query.timeframe as string;
    if (timeframe && !['WEEKLY', 'MONTHLY', 'YEARLY'].includes(timeframe.toUpperCase())) {
      res.status(400).json({
        success: false,
        message: 'Invalid timeframe. Must be WEEKLY, MONTHLY, or YEARLY',
      });
      return;
    }
    next();
  }
}
