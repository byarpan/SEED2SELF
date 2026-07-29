import { Request, Response, NextFunction } from 'express';
import { AdminService, adminService } from './admin.service.js';

export class AdminController {
  constructor(private service: AdminService = adminService) {}

  adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.adminLogin(req.body);
      res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Admin authentication failed',
      });
    }
  };

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const stats = await this.service.getDashboard(adminId);
      res.status(200).json({
        success: true,
        message: 'Admin dashboard metrics retrieved successfully',
        data: stats,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const { role, search, status } = req.query;
      const users = await this.service.getUsersList(adminId, role as string, search as string, status as string);
      res.status(200).json({
        success: true,
        message: 'Platform users retrieved successfully',
        data: users,
      });
    } catch (error: any) {
      next(error);
    }
  };

  updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const adminEmail = (req as any).user?.email || 'admin@seed2shelf.com';
      const result = await this.service.updateUserStatus(adminId, adminEmail, req.body);
      res.status(200).json({
        success: true,
        message: 'User account status updated successfully',
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getKYCList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const { status } = req.query;
      const kycList = await this.service.getKYCList(adminId, status as string);
      res.status(200).json({
        success: true,
        message: 'KYC applications retrieved successfully',
        data: kycList,
      });
    } catch (error: any) {
      next(error);
    }
  };

  verifyKYC = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const adminEmail = (req as any).user?.email || 'admin@seed2shelf.com';
      const result = await this.service.verifyUserKYC(adminId, adminEmail, req.body);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.kyc,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const logs = await this.service.getAuditLogs(adminId);
      res.status(200).json({
        success: true,
        message: 'System audit logs retrieved successfully',
        data: logs,
      });
    } catch (error: any) {
      next(error);
    }
  };

  globalSearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const term = (req.query.q || req.query.term || '') as string;
      const searchResults = await this.service.globalSearch(adminId, term);
      res.status(200).json({
        success: true,
        message: 'Global admin search completed',
        data: searchResults,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const { status, priority } = req.query;
      const tickets = await this.service.getTickets(adminId, status as string, priority as string);
      res.status(200).json({ success: true, message: 'Support tickets retrieved', data: tickets });
    } catch (error: any) {
      next(error);
    }
  };

  replyToTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const adminName = (req as any).user?.name || 'Platform Admin';
      const { ticketId } = req.params;
      const { message } = req.body;
      const reply = await this.service.replyToTicket(adminId, adminName, ticketId, message);
      res.status(200).json({ success: true, message: 'Reply sent successfully', data: reply });
    } catch (error: any) {
      next(error);
    }
  };

  updateTicketStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const adminEmail = (req as any).user?.email || 'admin@seed2shelf.com';
      const { ticketId } = req.params;
      const { status, priority } = req.body;
      const updated = await this.service.updateTicketStatus(adminId, adminEmail, ticketId, status, priority);
      res.status(200).json({ success: true, message: 'Ticket status updated', data: updated });
    } catch (error: any) {
      next(error);
    }
  };

  getReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const { status, type } = req.query;
      const reports = await this.service.getReports(adminId, status as string, type as string);
      res.status(200).json({ success: true, message: 'Reports retrieved', data: reports });
    } catch (error: any) {
      next(error);
    }
  };

  updateReportStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const adminEmail = (req as any).user?.email || 'admin@seed2shelf.com';
      const { reportId } = req.params;
      const { status, notes } = req.body;
      const updated = await this.service.updateReportStatus(adminId, adminEmail, reportId, status, notes);
      res.status(200).json({ success: true, message: 'Report status updated', data: updated });
    } catch (error: any) {
      next(error);
    }
  };

  getOrdersList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const { status } = req.query;
      const orders = await this.service.getOrdersList(adminId, status as string);
      res.status(200).json({ success: true, message: 'Orders retrieved', data: orders });
    } catch (error: any) {
      next(error);
    }
  };

  getPaymentsList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const payments = await this.service.getPaymentsList(adminId);
      res.status(200).json({ success: true, message: 'Payments retrieved', data: payments });
    } catch (error: any) {
      next(error);
    }
  };

  getWalletsList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const wallets = await this.service.getWalletsList(adminId);
      res.status(200).json({ success: true, message: 'Wallets retrieved', data: wallets });
    } catch (error: any) {
      next(error);
    }
  };

  getAnalyticsData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const analytics = await this.service.getAnalyticsData(adminId);
      res.status(200).json({ success: true, message: 'Analytics retrieved', data: analytics });
    } catch (error: any) {
      next(error);
    }
  };

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const notifications = await this.service.getNotifications(adminId);
      res.status(200).json({ success: true, message: 'Notifications retrieved', data: notifications });
    } catch (error: any) {
      next(error);
    }
  };
}

export const adminController = new AdminController();
