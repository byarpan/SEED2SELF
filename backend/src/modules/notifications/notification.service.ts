import { NotificationRepository, notificationRepository } from './notification.repository.js';
import { CreateNotificationDTO, NotificationQueryDTO } from './dto/notification.dto.js';
import {
  NotificationResponse,
  NotificationListResponse,
  UnreadCountResponse,
} from './interfaces/notification.interface.js';
import { INotification } from '../../shared/models/Notification.js';
import { generateNotificationId } from '../../shared/helpers/sequence.helper.js';

export class NotificationService {
  constructor(private repository: NotificationRepository = notificationRepository) {}

  private mapToResponse(notification: INotification): NotificationResponse {
    return {
      id: notification._id.toString(),
      notificationId: notification.notificationId,
      userId: notification.userId.toString(),
      role: notification.role,
      title: notification.title,
      message: notification.message,
      notificationType: notification.notificationType,
      referenceType: notification.referenceType,
      referenceId: notification.referenceId,
      clickDestination: notification.clickDestination,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }

  async createNotification(dto: CreateNotificationDTO): Promise<NotificationResponse> {
    const notificationId = await generateNotificationId();
    const notification = await this.repository.createNotification({
      notificationId,
      userId: dto.userId as any,
      role: dto.role,
      title: dto.title,
      message: dto.message,
      notificationType: dto.notificationType,
      referenceType: dto.referenceType,
      referenceId: dto.referenceId,
      clickDestination: dto.clickDestination,
      isRead: false,
    });

    return this.mapToResponse(notification);
  }

  async getUserNotifications(userId: string, query?: NotificationQueryDTO): Promise<NotificationListResponse> {
    const { notifications, total, unreadCount } = await this.repository.findUserNotifications({
      ...query,
      userId,
    });

    return {
      notifications: notifications.map(n => this.mapToResponse(n)),
      total,
      unreadCount,
      page: query?.page || 1,
      limit: query?.limit || 50,
    };
  }

  async getUnreadNotifications(userId: string): Promise<NotificationListResponse> {
    return this.getUserNotifications(userId, { isRead: false });
  }

  async getUnreadCount(userId: string): Promise<UnreadCountResponse> {
    const unreadCount = await this.repository.getUnreadCount(userId);
    return { unreadCount };
  }

  async markAsRead(userId: string, id: string): Promise<NotificationResponse> {
    const notification = await this.repository.findNotificationById(id);
    if (!notification) {
      throw new Error(`Notification '${id}' not found`);
    }

    const updated = await this.repository.markAsRead(id);
    return this.mapToResponse(updated || notification);
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const modifiedCount = await this.repository.markAllAsRead(userId);
    return { modifiedCount };
  }

  async deleteNotification(userId: string, id: string): Promise<{ success: boolean }> {
    const notification = await this.repository.findNotificationById(id);
    if (!notification) {
      throw new Error(`Notification '${id}' not found`);
    }

    const success = await this.repository.deleteNotification(id);
    return { success };
  }
}

export const notificationService = new NotificationService();
