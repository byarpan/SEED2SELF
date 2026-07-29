import { Request, Response, NextFunction } from 'express';
import { ReportsService, reportsService } from './reports.service.js';

export class ReportsController {
  constructor(private service: ReportsService = reportsService) {}

  getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const timeframe = (req.query.timeframe as 'WEEKLY' | 'MONTHLY' | 'YEARLY') || 'MONTHLY';

      const result = await this.service.getAnalytics(processorIdentifier, { timeframe });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch analytics report',
      });
    }
  };

  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const timeframe = (req.query.timeframe as 'WEEKLY' | 'MONTHLY' | 'YEARLY') || 'MONTHLY';

      const result = await this.service.getAnalytics(processorIdentifier, { timeframe });
      res.status(200).json({
        success: true,
        data: {
          produceTransformed: result.produceTransformed,
          totalRevenue: result.totalRevenue,
          escrowLocked: result.escrowLocked,
          disputeRate: result.disputeRate,
          successfulShipments: result.successfulShipments,
          totalOrders: result.totalOrders,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch summary metrics',
      });
    }
  };

  getRevenueTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const timeframe = (req.query.timeframe as 'WEEKLY' | 'MONTHLY' | 'YEARLY') || 'MONTHLY';

      const result = await this.service.getAnalytics(processorIdentifier, { timeframe });
      res.status(200).json({
        success: true,
        data: {
          timeframe: result.timeframe,
          trendData: result.trendData,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch revenue trend data',
      });
    }
  };

  getProductShare = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const timeframe = (req.query.timeframe as 'WEEKLY' | 'MONTHLY' | 'YEARLY') || 'MONTHLY';

      const result = await this.service.getAnalytics(processorIdentifier, { timeframe });
      res.status(200).json({
        success: true,
        data: {
          timeframe: result.timeframe,
          productBreakdown: result.productBreakdown,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch product share analytics',
      });
    }
  };

  exportCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const timeframe = (req.query.timeframe as 'WEEKLY' | 'MONTHLY' | 'YEARLY') || 'MONTHLY';

      const csvData = await this.service.generateCSV(processorIdentifier, { timeframe });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=processor_report_${timeframe.toLowerCase()}_${Date.now()}.csv`);
      res.status(200).send(csvData);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to export CSV report',
      });
    }
  };

  downloadPDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const timeframe = (req.query.timeframe as 'WEEKLY' | 'MONTHLY' | 'YEARLY') || 'MONTHLY';

      const pdfBuffer = await this.service.generatePDF(processorIdentifier, { timeframe });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=processor_report_${timeframe.toLowerCase()}_${Date.now()}.pdf`);
      res.status(200).send(pdfBuffer);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to generate PDF report',
      });
    }
  };
}

export const reportsController = new ReportsController();
