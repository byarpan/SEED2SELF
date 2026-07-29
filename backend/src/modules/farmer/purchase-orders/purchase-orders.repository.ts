import mongoose from 'mongoose';
import Order, { IOrder } from '../../../shared/models/Order.js';
import Harvest, { IHarvest } from '../../../shared/models/Harvest.js';
import Payment, { IPayment } from '../../../shared/models/Payment.js';
import Escrow, { IEscrow } from '../../../shared/models/Escrow.js';
import Shipment, { IShipment } from '../../../shared/models/Shipment.js';
import User, { IUser } from '../../../shared/models/User.js';
import TraceabilityEvent, { ITraceabilityEvent } from '../../../shared/models/TraceabilityEvent.js';
import { PurchaseOrderQueryDTO } from './dto/purchase-orders.dto.js';

export class PurchaseOrdersRepository {
  async findUserById(userId: string): Promise<IUser | null> {
    if (!userId) return null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId).exec();
      if (user) return user;
    }
    return User.findOne({
      $or: [
        { farmerId: userId },
        { processorId: userId },
        { userId: userId },
        { phone: userId },
        { email: userId.toLowerCase() },
      ],
    }).exec();
  }

  async findOrderById(orderId: string): Promise<IOrder | null> {
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      const found = await Order.findById(orderId).exec();
      if (found) return found;
    }
    return Order.findOne({ orderNumber: orderId }).exec();
  }

  async findOrderByNumber(orderNumber: string): Promise<IOrder | null> {
    return Order.findOne({ orderNumber }).exec();
  }

  async createOrder(orderData: Partial<IOrder>): Promise<IOrder> {
    const order = new Order(orderData);
    return order.save();
  }

  async findOrdersByFarmerId(
    user: IUser,
    statusFilter?: string[],
    query?: PurchaseOrderQueryDTO
  ): Promise<{ orders: IOrder[]; total: number }> {
    const filter: any = {
      $or: [
        { farmerId: user._id },
      ],
    };

    if (statusFilter && statusFilter.length > 0) {
      filter.deliveryStatus = { $in: statusFilter };
    }

    if (query?.search && query.search.trim() !== '') {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$and = [
        {
          $or: [
            { orderNumber: regex },
            { batchNumber: regex },
            { buyerName: regex },
            { cropName: regex },
          ],
        },
      ];
    }

    const total = await Order.countDocuments(filter);
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return { orders, total };
  }

  async updateOrder(orderId: string, updateData: Partial<IOrder>): Promise<IOrder | null> {
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      const updated = await Order.findByIdAndUpdate(orderId, { $set: updateData }, { new: true, runValidators: true }).exec();
      if (updated) return updated;
    }
    return Order.findOneAndUpdate({ orderNumber: orderId }, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async createPayment(paymentData: Partial<IPayment>): Promise<IPayment> {
    const payment = new Payment(paymentData);
    return payment.save();
  }

  async findPaymentByOrderId(orderId: string): Promise<IPayment | null> {
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      const found = await Payment.findOne({ orderId }).exec();
      if (found) return found;
    }
    return Payment.findOne({ orderId }).exec();
  }

  async updatePayment(paymentId: string, updateData: Partial<IPayment>): Promise<IPayment | null> {
    if (mongoose.Types.ObjectId.isValid(paymentId)) {
      const updated = await Payment.findByIdAndUpdate(paymentId, { $set: updateData }, { new: true, runValidators: true }).exec();
      if (updated) return updated;
    }
    return Payment.findOneAndUpdate({ paymentId }, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async createEscrow(escrowData: Partial<IEscrow>): Promise<IEscrow> {
    const escrow = new Escrow(escrowData);
    return escrow.save();
  }

  async findEscrowByOrderId(orderId: string): Promise<IEscrow | null> {
    return Escrow.findOne({ orderId }).exec();
  }

  async updateEscrow(escrowId: string, updateData: Partial<IEscrow>): Promise<IEscrow | null> {
    if (mongoose.Types.ObjectId.isValid(escrowId)) {
      const updated = await Escrow.findByIdAndUpdate(escrowId, { $set: updateData }, { new: true, runValidators: true }).exec();
      if (updated) return updated;
    }
    return Escrow.findOneAndUpdate({ escrowId }, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async findHarvestByBatchId(batchId: string): Promise<IHarvest | null> {
    return Harvest.findOne({ batchId }).exec();
  }

  async updateHarvest(harvestId: string, updateData: Partial<IHarvest>): Promise<IHarvest | null> {
    if (mongoose.Types.ObjectId.isValid(harvestId)) {
      const updated = await Harvest.findByIdAndUpdate(harvestId, { $set: updateData }, { new: true, runValidators: true }).exec();
      if (updated) return updated;
    }
    return Harvest.findOneAndUpdate({ batchId: harvestId }, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async createShipment(shipmentData: Partial<IShipment>): Promise<IShipment> {
    const shipment = new Shipment(shipmentData);
    return shipment.save();
  }

  async findShipmentByOrderId(orderId: string): Promise<IShipment | null> {
    return Shipment.findOne({ orderId }).exec();
  }

  async createTraceabilityEvent(eventData: Partial<ITraceabilityEvent>): Promise<ITraceabilityEvent> {
    const event = new TraceabilityEvent(eventData);
    return event.save();
  }
}

export const purchaseOrdersRepository = new PurchaseOrdersRepository();
