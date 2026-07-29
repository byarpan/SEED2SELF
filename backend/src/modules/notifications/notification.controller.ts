import { Request, Response, NextFunction } from 'express';
import { NotificationService, notificationService } from './notification.service.js';
import { NotificationValidator } from './notification.validator.js';

export class NotificationController {
  constructor(private service: NotificationService = notificationService) {}

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId || 'S2S-USR-000001';
      const result = await this.service.getUserNotifications(userId as string, {
        role: req.query.role as string,
        isRead: req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      });

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: result.notifications,
        unreadCount: result.unreadCount,
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

  getUnreadNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId || 'S2S-USR-000001';
      const result = await this.service.getUnreadNotifications(userId as string);

      res.status(200).json({
        success: true,
        message: 'Unread notifications retrieved successfully',
        data: result.notifications,
        unreadCount: result.unreadCount,
      });
    } catch (error: any) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId || req.query.userId || 'S2S-USR-000001';
      const { id } = req.params;

      const validation = NotificationValidator.validateId(id);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const notification = await this.service.markAsRead(userId as string, id);
      res.status(200).json({
        success: true,
        message: 'Notification marked as read successfully',
        data: notification,
      });
    } catch (error: any) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId || req.query.userId || 'S2S-USR-000001';
      const result = await this.service.markAllAsRead(userId as string);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read successfully',
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || 'S2S-USR-000001';
      const { id } = req.params;

      const validation = NotificationValidator.validateId(id);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const result = await this.service.deleteNotification(userId as string, id);
      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export const notificationController = new NotificationController();
