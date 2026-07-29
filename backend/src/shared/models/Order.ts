import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatusType =
  | 'PENDING_FARMER_ACCEPTANCE'
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PROCESSING'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type DeliveryStatusType =
  | 'NOT_STARTED'
  | 'PENDING_FARMER_ACCEPTANCE'
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'READY_FOR_PICKUP'
  | 'IN_TRANSIT'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CONFIRMED'
  | 'CANCELLED';

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderId?: string;
  orderNumber: string;
  farmerId: mongoose.Types.ObjectId;
  processorId: mongoose.Types.ObjectId;
  buyerName: string;
  cropName: string;
  variety?: string;
  batchNumber: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  orderStatus: OrderStatusType;
  deliveryStatus: DeliveryStatusType;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  escrowStatus: 'LOCKED' | 'RELEASED' | 'REFUNDED';
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema<IOrder>(
  {
    orderId: { type: String, trim: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    processorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    buyerName: { type: String, required: true, trim: true },
    cropName: { type: String, required: true, trim: true },
    variety: { type: String, trim: true },
    batchNumber: { type: String, required: true, trim: true },
    quantityKg: { type: Number, required: true, min: 0 },
    pricePerKg: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    orderStatus: {
      type: String,
      enum: [
        'PENDING_FARMER_ACCEPTANCE',
        'PENDING',
        'ACCEPTED',
        'REJECTED',
        'PROCESSING',
        'DISPATCHED',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'PENDING_FARMER_ACCEPTANCE',
      index: true,
    },
    deliveryStatus: {
      type: String,
      enum: [
        'NOT_STARTED',
        'PENDING_FARMER_ACCEPTANCE',
        'PENDING',
        'ACCEPTED',
        'REJECTED',
        'READY_FOR_PICKUP',
        'IN_TRANSIT',
        'DISPATCHED',
        'DELIVERED',
        'CONFIRMED',
        'CANCELLED',
      ],
      default: 'NOT_STARTED',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },
    escrowStatus: {
      type: String,
      enum: ['LOCKED', 'RELEASED', 'REFUNDED'],
      default: 'LOCKED',
    },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
