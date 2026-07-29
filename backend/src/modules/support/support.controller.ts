import { Request, Response, NextFunction } from 'express';
import { SupportService, supportService } from './support.service.js';
import { SupportValidator } from './support.validator.js';

export class SupportController {
  constructor(private service: SupportService = supportService) {}

  createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId || 'S2S-USR-000001';
      const validation = SupportValidator.validateCreateTicket(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const ticket = await this.service.createTicket(userId as string, req.body);
      res.status(201).json({
        success: true,
        message: 'Support ticket created successfully',
        data: ticket,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      const result = await this.service.getTickets(userId as string, {
        role: req.query.role as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        category: req.query.category as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      });

      res.status(200).json({
        success: true,
        message: 'Support tickets retrieved successfully',
        data: result.tickets,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  getTicketDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId || 'S2S-USR-000001';
      const { ticketId } = req.params;

      if (!ticketId) {
        res.status(400).json({ success: false, message: 'Ticket ID or Ticket Number is required' });
        return;
      }

      const ticket = await this.service.getTicketDetails(userId as string, ticketId);
      res.status(200).json({
        success: true,
        message: 'Support ticket details retrieved successfully',
        data: ticket,
      });
    } catch (error: any) {
      next(error);
    }
  };

  updateTicketStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId || 'S2S-USR-000001';
      const { ticketId } = req.params;

      if (!ticketId) {
        res.status(400).json({ success: false, message: 'Ticket ID or Ticket Number is required' });
        return;
      }

      const validation = SupportValidator.validateUpdateStatus(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const ticket = await this.service.updateTicketStatus(userId as string, ticketId, req.body);
      res.status(200).json({
        success: true,
        message: `Ticket status updated to '${req.body.status}' successfully`,
        data: ticket,
      });
    } catch (error: any) {
      next(error);
    }
  };

  addReply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId || 'S2S-USR-000001';
      const { ticketId } = req.params;

      if (!ticketId) {
        res.status(400).json({ success: false, message: 'Ticket ID or Ticket Number is required' });
        return;
      }

      const validation = SupportValidator.validateAddReply(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const ticket = await this.service.addReply(userId as string, ticketId, req.body);
      res.status(200).json({
        success: true,
        message: 'Support reply added successfully',
        data: ticket,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const role = req.query.role as string;
      const categories = await this.service.getCategories(role);
      res.status(200).json({
        success: true,
        message: 'Support categories retrieved successfully',
        data: categories,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getFAQs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const faqs = await this.service.getFAQs({
        role: req.query.role as string,
        category: req.query.category as string,
        search: req.query.search as string,
      });

      res.status(200).json({
        success: true,
        message: 'FAQs retrieved successfully',
        data: faqs,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getPriorities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const priorities = this.service.getPriorities();
      res.status(200).json({
        success: true,
        message: 'Support priorities retrieved successfully',
        data: priorities,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getStatuses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const statuses = this.service.getStatuses();
      res.status(200).json({
        success: true,
        message: 'Support ticket statuses retrieved successfully',
        data: statuses,
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export const supportController = new SupportController();
