import mongoose from 'mongoose';
import Order, { IOrder, OrderStatusType, DeliveryStatusType } from '../../../shared/models/Order.js';
import ProcessedProduct, { IProcessedProduct } from '../../../shared/models/ProcessedProduct.js';
import Payment from '../../../shared/models/Payment.js';
import Escrow from '../../../shared/models/Escrow.js';
import Shipment, { IShipment } from '../../../shared/models/Shipment.js';
import User, { IUser } from '../../../shared/models/User.js';
import { PurchaseOrderQueryDTO } from './dto/purchase-orders.dto.js';
import { generateSequenceId } from '../../../shared/helpers/sequence.helper.js';

export class PurchaseOrdersRepository {
  /**
   * Find User by ID, processorId, userId, or email with fallback
   */
  async findUserByIdOrProcessorId(identifier: string): Promise<IUser | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    if (isObjectId) {
      const user = await User.findById(identifier).exec();
      if (user) return user;
    }
    const foundUser = await User.findOne({
      $or: [
        { processorId: identifier },
        { userId: identifier },
        { email: identifier.toLowerCase() },
      ],
    }).exec();

    if (foundUser) return foundUser;

    // Fallback default processor user when no DB user matches demo session
    let defaultUser = await User.findOne({ role: 'PROCESSOR' }).exec();
    if (!defaultUser) {
      try {
        defaultUser = await User.create({
          processorId: 'PRC-DEMO-001',
          role: 'PROCESSOR',
          fullName: 'Central Grain Processing Plant',
          email: 'processor@seed2shelf.com',
          phone: '+91 98765 43210',
          verificationStatus: 'VERIFIED',
          averageRating: 4.8,
          reviewCount: 12,
        });
      } catch (err) {
        return {
          _id: new mongoose.Types.ObjectId('65f1a2b3c4d5e6f7a8b9c0d1'),
          processorId: 'PRC-DEMO-001',
          role: 'PROCESSOR',
          fullName: 'Central Grain Processing Plant',
          email: 'processor@seed2shelf.com',
          phone: '+91 98765 43210',
          verificationStatus: 'VERIFIED',
        } as any;
      }
    }
    return defaultUser;
  }

  /**
   * Find orders belonging to Processor as seller (or buyer in fallback)
   */
  async findOrdersByProcessorId(
    processorId: string,
    statusFilter?: string[],
    query?: PurchaseOrderQueryDTO
  ): Promise<{ orders: IOrder[]; total: number }> {
    const filter: any = {};

    if (mongoose.Types.ObjectId.isValid(processorId)) {
      filter.$or = [
        { processorId: new mongoose.Types.ObjectId(processorId) },
        { farmerId: new mongoose.Types.ObjectId(processorId) },
      ];
    } else {
      filter.$or = [{ processorId }, { farmerId: processorId }];
    }

    if (statusFilter && statusFilter.length > 0) {
      filter.orderStatus = { $in: statusFilter };
    }

    if (query?.search && query.search.trim() !== '') {
      const sRegex = new RegExp(query.search.trim(), 'i');
      filter.$and = [
        {
          $or: [
            { orderNumber: sRegex },
            { batchNumber: sRegex },
            { cropName: sRegex },
            { buyerName: sRegex },
            { variety: sRegex },
          ],
        },
      ];
    }

    const sortField = query?.sortBy || 'createdAt';
    const sortOrder = query?.sortOrder === 'asc' ? 1 : -1;
    const sortObj: any = { [sortField]: sortOrder };

    const total = await Order.countDocuments(filter);

    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('farmerId', 'fullName email phone processorId role')
      .populate('processorId', 'fullName email phone processorId role')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .exec();

    return { orders, total };
  }

  /**
   * Count order status breakdown
   */
  async countOrdersByStatus(processorId: string): Promise<{
    all: number;
    pending: number;
    accepted: number;
    rejected: number;
    dispatched: number;
  }> {
    const isObjId = mongoose.Types.ObjectId.isValid(processorId);
    const baseFilter = isObjId
      ? { $or: [{ processorId: new mongoose.Types.ObjectId(processorId) }, { farmerId: new mongoose.Types.ObjectId(processorId) }] }
      : { $or: [{ processorId }, { farmerId: processorId }] };

    const all = await Order.countDocuments(baseFilter);
    const pending = await Order.countDocuments({
      ...baseFilter,
      orderStatus: { $in: ['PENDING_PROCESSOR_ACCEPTANCE', 'PENDING_FARMER_ACCEPTANCE', 'PENDING'] },
    });
    const accepted = await Order.countDocuments({ ...baseFilter, orderStatus: 'ACCEPTED' });
    const rejected = await Order.countDocuments({ ...baseFilter, orderStatus: 'REJECTED' });
    const dispatched = await Order.countDocuments({
      ...baseFilter,
      orderStatus: { $in: ['DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'] },
    });

    return { all, pending, accepted, rejected, dispatched };
  }

  /**
   * Find order by ObjectId or Order Number
   */
  async findOrderByIdOrNumber(orderIdOrNumber: string): Promise<IOrder | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(orderIdOrNumber);
    const query = isObjectId
      ? { $or: [{ _id: new mongoose.Types.ObjectId(orderIdOrNumber) }, { orderNumber: orderIdOrNumber }] }
      : { orderNumber: orderIdOrNumber };

    return Order.findOne(query)
      .populate('farmerId', 'fullName email phone processorId role')
      .populate('processorId', 'fullName email phone processorId role')
      .exec();
  }

  /**
   * Update Order status and delivery status
   */
  async updateOrderStatus(
    orderId: string,
    orderStatus: OrderStatusType,
    deliveryStatus?: DeliveryStatusType,
    escrowStatus?: 'LOCKED' | 'RELEASED' | 'REFUNDED'
  ): Promise<IOrder | null> {
    const updatePayload: any = { orderStatus };
    if (deliveryStatus) {
      updatePayload.deliveryStatus = deliveryStatus;
    }
    if (escrowStatus) {
      updatePayload.escrowStatus = escrowStatus;
    }

    return Order.findByIdAndUpdate(
      orderId,
      { $set: updatePayload },
      { new: true }
    ).exec();
  }

  /**
   * Find Processed Product by batch number
   */
  async findProcessedProductByBatchNumber(batchNumber: string): Promise<IProcessedProduct | null> {
    return ProcessedProduct.findOne({
      $or: [{ batchId: batchNumber }, { processedProductId: batchNumber }],
    }).exec();
  }

  /**
   * Restore available quantity on processed product if order is rejected
   */
  async restoreProcessedProductInventory(batchNumber: string, quantityKg: number): Promise<IProcessedProduct | null> {
    return ProcessedProduct.findOneAndUpdate(
      { $or: [{ batchId: batchNumber }, { processedProductId: batchNumber }] },
      { $inc: { availableQuantity: quantityKg } },
      { new: true }
    ).exec();
  }

  /**
   * Create a new Shipment document for Start Delivery
   */
  async createShipment(data: {
    orderId: mongoose.Types.ObjectId;
    batchId: string;
    farmerId: mongoose.Types.ObjectId;
    processorId?: mongoose.Types.ObjectId;
    cargoName?: string;
    cargoQuantity?: string;
    cargoValue?: number;
    destination?: string;
    carrierName?: string;
    trackingNumber?: string;
  }): Promise<IShipment> {
    const shipmentId = `S2S-SHP-${Date.now()}`;
    const shipment = new Shipment({
      shipmentId,
      orderId: data.orderId,
      batchId: data.batchId,
      farmerId: data.farmerId,
      processorId: data.processorId,
      cargoName: data.cargoName || 'Processed Crop Cargo',
      cargoQuantity: data.cargoQuantity || '1 Shipment',
      cargoValue: data.cargoValue || 0,
      destination: data.destination || 'Distributor Facility',
      carrierName: data.carrierName || 'Express Logistics',
      trackingNumber: data.trackingNumber || `TRK-${Date.now()}`,
      shipmentStatus: 'IN_TRANSIT',
      inspectionResult: 'PASSED',
      dispatchedAt: new Date(),
    });

    return shipment.save();
  }

  /**
   * Find Shipment by order ID
   */
  async findShipmentByOrderId(orderId: string): Promise<IShipment | null> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) return null;
    return Shipment.findOne({ orderId: new mongoose.Types.ObjectId(orderId) }).exec();
  }
}

export const purchaseOrdersRepository = new PurchaseOrdersRepository();
