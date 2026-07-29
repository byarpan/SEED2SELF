import mongoose from 'mongoose';
import Order, { IOrder } from '../models/Order.js';

export interface CreateOrderParams {
  farmerId: string | mongoose.Types.ObjectId;
  processorId: string | mongoose.Types.ObjectId;
  buyerName: string;
  cropName: string;
  variety?: string;
  batchNumber: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  orderStatus?: 'PENDING_FARMER_ACCEPTANCE' | 'ACCEPTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  deliveryStatus?: 'NOT_STARTED' | 'READY_FOR_PICKUP' | 'IN_TRANSIT' | 'DELIVERED' | 'CONFIRMED';
  paymentStatus?: 'PENDING' | 'SUCCESS' | 'FAILED';
  escrowStatus?: 'LOCKED' | 'RELEASED' | 'REFUNDED';
}

export class SharedOrderService {
  async createOrder(params: CreateOrderParams): Promise<IOrder> {
    const orderNumber = `ORD-PRC-${Date.now().toString().slice(-6)}`;

    const order = new Order({
      orderNumber,
      farmerId: new mongoose.Types.ObjectId(params.farmerId.toString()),
      processorId: new mongoose.Types.ObjectId(params.processorId.toString()),
      buyerName: params.buyerName,
      cropName: params.cropName,
      variety: params.variety || 'Standard',
      batchNumber: params.batchNumber,
      quantityKg: params.quantityKg,
      pricePerKg: params.pricePerKg,
      totalAmount: params.totalAmount,
      orderStatus: params.orderStatus || 'PENDING_FARMER_ACCEPTANCE',
      deliveryStatus: params.deliveryStatus || 'NOT_STARTED',
      paymentStatus: params.paymentStatus || 'SUCCESS',
      escrowStatus: params.escrowStatus || 'LOCKED',
    });

    return order.save();
  }

  async updateOrderStatus(
    orderId: string,
    orderStatus: 'PENDING_FARMER_ACCEPTANCE' | 'ACCEPTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
  ): Promise<IOrder | null> {
    return Order.findOneAndUpdate(
      { $or: [{ _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : undefined }, { orderNumber: orderId }] },
      { $set: { orderStatus } },
      { new: true }
    ).exec();
  }
}

export const sharedOrderService = new SharedOrderService();
