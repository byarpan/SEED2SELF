import { Request, Response, NextFunction } from 'express';
import { SupportService, supportService } from './support.service.js';

export class SupportController {
  constructor(private service: SupportService = supportService) {}

  createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || req.body.processorId || (req.query.processorId as string) || 'demo-processor-id';
      const ticket = await this.service.createTicket(processorIdentifier, req.body);
      res.status(201).json({
        success: true,
        message: 'Support ticket raised successfully',
        data: ticket,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to raise support ticket',
      });
    }
  };

  getTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const status = (req.query.status as any) || undefined;
      const category = (req.query.category as string) || undefined;
      const priority = (req.query.priority as any) || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await this.service.getTickets(processorIdentifier, {
        page,
        limit,
        status,
        category,
        priority,
        search,
      });

      res.status(200).json({
        success: true,
        data: result.tickets,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch support tickets',
      });
    }
  };

  getTicketDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const { id } = req.params;

      const ticket = await this.service.getTicketDetails(processorIdentifier, id);
      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Support ticket details not found',
      });
    }
  };

  replyToTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || req.body.processorId || (req.query.processorId as string) || 'demo-processor-id';
      const { id } = req.params;

      const reply = await this.service.replyToTicket(processorIdentifier, id, req.body);
      res.status(201).json({
        success: true,
        message: 'Reply added successfully',
        data: reply,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to reply to support ticket',
      });
    }
  };

  closeTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || req.body.processorId || (req.query.processorId as string) || 'demo-processor-id';
      const { id } = req.params;

      const ticket = await this.service.closeTicket(processorIdentifier, id);
      res.status(200).json({
        success: true,
        message: 'Support ticket closed successfully',
        data: ticket,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to close support ticket',
      });
    }
  };

  getFAQs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const faqs = await this.service.getFAQs();
      res.status(200).json({
        success: true,
        data: faqs,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch platform FAQs',
      });
    }
  };

  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = this.service.getCategories();
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch support categories',
      });
    }
  };
}

export const supportController = new SupportController();
