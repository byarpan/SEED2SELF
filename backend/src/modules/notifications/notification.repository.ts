import mongoose from 'mongoose';
import Notification, { INotification } from '../../shared/models/Notification.js';
import User, { IUser } from '../../shared/models/User.js';
import { NotificationQueryDTO } from './dto/notification.dto.js';
import { resolveUser } from '../../shared/utils/userResolver.js';

export class NotificationRepository {
  async findUserById(userId: string): Promise<IUser | null> {
    return resolveUser(userId);
  }

  async createNotification(notificationData: Partial<INotification>): Promise<INotification> {
    const notification = new Notification(notificationData);
    return notification.save();
  }

  async findNotificationById(id: string): Promise<INotification | null> {
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      const found = await Notification.findById(id).exec();
      if (found) return found;
    }
    return Notification.findOne({ notificationId: id }).exec();
  }

  private async buildUserFilter(userId?: string, role?: string): Promise<any> {
    const filter: any = {};

    if (userId) {
      const user = await resolveUser(userId);
      if (user) {
        filter.userId = user._id;
      } else {
        filter.role = role || 'FARMER';
      }
    } else if (role) {
      filter.role = role;
    }

    return filter;
  }

  async findUserNotifications(query: NotificationQueryDTO): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    const filter = await this.buildUserFilter(query.userId, query.role);

    if (query.isRead !== undefined) {
      filter.isRead = query.isRead;
    }

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return { notifications, total, unreadCount };
  }

  async getUnreadCount(userId: string): Promise<number> {
    if (!userId) return 0;
    const filter = await this.buildUserFilter(userId);
    return Notification.countDocuments({ ...filter, isRead: false });
  }

  async markAsRead(id: string): Promise<INotification | null> {
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await Notification.findByIdAndUpdate(id, { $set: { isRead: true } }, { new: true }).exec();
      if (updated) return updated;
    }
    return Notification.findOneAndUpdate({ notificationId: id }, { $set: { isRead: true } }, { new: true }).exec();
  }

  async markAllAsRead(userId: string): Promise<number> {
    const filter = await this.buildUserFilter(userId);
    // Remove isRead from base filter before adding isRead: false
    delete filter.isRead;

    const result = await Notification.updateMany({ ...filter, isRead: false }, { $set: { isRead: true } }).exec();
    return result.modifiedCount;
  }

  async deleteNotification(id: string): Promise<boolean> {
    let result;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      result = await Notification.findByIdAndDelete(id).exec();
    } else {
      result = await Notification.findOneAndDelete({ notificationId: id }).exec();
    }
    return !!result;
  }
}

export const notificationRepository = new NotificationRepository();
