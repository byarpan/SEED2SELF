import mongoose from 'mongoose';
import Notification, { INotification } from '../models/Notification.js';

export interface CreateNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  role: 'FARMER' | 'PROCESSOR' | 'DISTRIBUTOR' | 'RETAILER' | 'CUSTOMER' | 'ADMIN';
  title: string;
  message: string;
  notificationType?: string;
  referenceType?: 'ORDER' | 'SHIPMENT' | 'BATCH' | 'PAYMENT' | 'WALLET_TRANSACTION' | 'INVOICE' | 'HARVEST' | 'SUPPORT_TICKET' | 'TRACEABILITY' | 'OTHER';
  referenceId?: string;
  clickDestination?: string;
}

export class SharedNotificationService {
  async createNotification(params: CreateNotificationParams): Promise<INotification> {
    const notificationId = `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const notification = new Notification({
      notificationId,
      userId: new mongoose.Types.ObjectId(params.userId.toString()),
      role: params.role,
      title: params.title,
      message: params.message,
      notificationType: params.notificationType || 'PURCHASE_ORDER',
      referenceType: params.referenceType || 'ORDER',
      referenceId: params.referenceId,
      clickDestination: params.clickDestination || '/farmer/purchase-orders',
      isRead: false,
    });

    return notification.save();
  }
}

export const sharedNotificationService = new SharedNotificationService();
