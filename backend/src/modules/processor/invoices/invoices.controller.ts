import { Request, Response, NextFunction } from 'express';
import { ProcessorInvoicesService, processorInvoicesService } from './invoices.service.js';

export class ProcessorInvoicesController {
  constructor(private service: ProcessorInvoicesService = processorInvoicesService) {}

  getInvoiceList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = req.params.id || (req as any).user?.id || 'demo-processor-id';
      const search = (req.query.search as string) || '';
      const category = (req.query.category as any) || 'ALL';

      const invoices = await this.service.getInvoiceList(identifier, { search, category });
      res.status(200).json({
        success: true,
        data: invoices,
      });
    } catch (error: any) {
      res.status(error.message.includes('not found') ? 404 : 400).json({
        success: false,
        message: error.message || 'Failed to retrieve processor invoices',
      });
    }
  };

  getInvoiceDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = (req as any).user?.id || req.query.processorId || 'demo-processor-id';
      const id = req.params.id;

      if (!id) {
        res.status(400).json({ success: false, message: 'Invoice ID is required' });
        return;
      }

      const invoice = await this.service.getInvoiceDetails(identifier as string, id);
      res.status(200).json({
        success: true,
        data: invoice,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Invoice details not found',
      });
    }
  };

  downloadInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = (req as any).user?.id || req.query.processorId || 'demo-processor-id';
      const id = req.params.id;

      if (!id) {
        res.status(400).json({ success: false, message: 'Invoice ID is required' });
        return;
      }

      const { filename, buffer } = await this.service.downloadInvoice(identifier as string, id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(buffer);
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Failed to download invoice PDF',
      });
    }
  };
}

export const processorInvoicesController = new ProcessorInvoicesController();
