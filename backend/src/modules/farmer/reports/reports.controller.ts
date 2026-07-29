import { Request, Response, NextFunction } from 'express';
import { ReportsService, reportsService } from './reports.service.js';
import { ReportsValidator } from './reports.validator.js';

export class ReportsController {
  constructor(private service: ReportsService = reportsService) {}

  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const validation = ReportsValidator.validateQuery(req.query as any);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const timeframe = (req.query.timeframe as any) || 'MONTHLY';
      const summary = await this.service.getAnalyticsSummary(userId as string, {
        timeframe,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      });

      res.status(200).json({
        success: true,
        message: 'Analytics summary retrieved successfully',
        data: summary,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getWeeklyReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const summary = await this.service.getAnalyticsSummary(userId as string, { timeframe: 'WEEKLY' });
      res.status(200).json({
        success: true,
        message: 'Weekly analytics report retrieved successfully',
        data: summary,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getMonthlyReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const summary = await this.service.getAnalyticsSummary(userId as string, { timeframe: 'MONTHLY' });
      res.status(200).json({
        success: true,
        message: 'Monthly analytics report retrieved successfully',
        data: summary,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getYearlyReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const summary = await this.service.getAnalyticsSummary(userId as string, { timeframe: 'YEARLY' });
      res.status(200).json({
        success: true,
        message: 'Yearly analytics report retrieved successfully',
        data: summary,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getRevenueTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const timeframe = (req.query.timeframe as any) || 'MONTHLY';
      const summary = await this.service.getAnalyticsSummary(userId as string, { timeframe });
      res.status(200).json({
        success: true,
        message: 'Revenue & Volume trend data retrieved successfully',
        data: summary.trendData,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getCropShare = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const timeframe = (req.query.timeframe as any) || 'MONTHLY';
      const summary = await this.service.getAnalyticsSummary(userId as string, { timeframe });
      res.status(200).json({
        success: true,
        message: 'Crop revenue breakdown retrieved successfully',
        data: summary.cropBreakdown,
      });
    } catch (error: any) {
      next(error);
    }
  };

  exportCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const timeframe = (req.query.timeframe as any) || 'MONTHLY';
      const fileResult = await this.service.exportCSV(userId as string, { timeframe });

      res.setHeader('Content-Type', fileResult.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileResult.fileName}"`);
      res.status(200).send(fileResult.content);
    } catch (error: any) {
      next(error);
    }
  };

  exportPDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const timeframe = (req.query.timeframe as any) || 'MONTHLY';
      const fileResult = await this.service.exportPDF(userId as string, { timeframe });

      res.status(200).json({
        success: true,
        message: 'PDF report generated successfully',
        data: fileResult,
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export const reportsController = new ReportsController();
