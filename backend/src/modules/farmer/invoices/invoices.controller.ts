import { Request, Response, NextFunction } from 'express';
import { InvoicesService, invoicesService } from './invoices.service.js';
import { InvoicesValidator } from './invoices.validator.js';

export class InvoicesController {
  constructor(private service: InvoicesService = invoicesService) {}

  getInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || (req.query.userId as string) || (req.headers['user-id'] as string);
      if (!userId) {
        res.status(400).json({ success: false, message: 'Farmer User ID is required' });
        return;
      }

      const validation = InvoicesValidator.validateQuery(req.query);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const invoices = await this.service.getInvoiceList(userId, validation.data);
      res.status(200).json({
        success: true,
        message: 'Farmer invoices retrieved successfully',
        data: invoices,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getInvoiceDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || (req.query.userId as string) || (req.headers['user-id'] as string);
      if (!userId) {
        res.status(400).json({ success: false, message: 'Farmer User ID is required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Invoice ID parameter is required' });
        return;
      }

      const details = await this.service.getInvoiceDetails(userId, id);
      res.status(200).json({
        success: true,
        message: 'Invoice details retrieved successfully',
        data: details,
      });
    } catch (error: any) {
      if (error.message === 'Invoice record not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };

  downloadInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || (req.query.userId as string) || (req.headers['user-id'] as string);
      if (!userId) {
        res.status(400).json({ success: false, message: 'Farmer User ID is required' });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Invoice ID parameter is required' });
        return;
      }

      const downloadData = await this.service.downloadInvoice(userId, id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadData.filename}"`);
      res.setHeader('Content-Length', downloadData.buffer.length);
      res.status(200).send(downloadData.buffer);
    } catch (error: any) {
      if (error.message === 'Invoice record not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  };
}

export const invoicesController = new InvoicesController();
