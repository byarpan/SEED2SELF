import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  notificationId: string;
  userId: mongoose.Types.ObjectId;
  role: 'FARMER' | 'PROCESSOR' | 'DISTRIBUTOR' | 'RETAILER' | 'CUSTOMER' | 'ADMIN';
  title: string;
  message: string;
  notificationType: string;
  referenceType?: 'ORDER' | 'SHIPMENT' | 'BATCH' | 'PAYMENT' | 'WALLET_TRANSACTION' | 'INVOICE' | 'HARVEST' | 'SUPPORT_TICKET' | 'TRACEABILITY' | 'OTHER';
  referenceId?: string;
  clickDestination?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema<INotification>(
  {
    notificationId: { type: String, required: true, unique: true, index: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: {
      type: String,
      enum: ['FARMER', 'PROCESSOR', 'DISTRIBUTOR', 'RETAILER', 'CUSTOMER', 'ADMIN'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    notificationType: { type: String, required: true, trim: true },
    referenceType: {
      type: String,
      enum: ['ORDER', 'SHIPMENT', 'BATCH', 'PAYMENT', 'WALLET_TRANSACTION', 'INVOICE', 'HARVEST', 'SUPPORT_TICKET', 'TRACEABILITY', 'OTHER'],
    },
    referenceId: { type: String, trim: true, index: true },
    clickDestination: { type: String, trim: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ role: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
