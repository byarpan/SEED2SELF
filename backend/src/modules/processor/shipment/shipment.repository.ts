import mongoose from 'mongoose';
import Shipment, { IShipment } from '../../../shared/models/Shipment.js';
import Order, { IOrder } from '../../../shared/models/Order.js';
import Harvest, { IHarvest } from '../../../shared/models/Harvest.js';
import ProcessedProduct, { IProcessedProduct } from '../../../shared/models/ProcessedProduct.js';
import User, { IUser } from '../../../shared/models/User.js';
import Wallet from '../../../shared/models/Wallet.js';
import WalletTransaction from '../../../shared/models/WalletTransaction.js';
import TraceabilityEvent from '../../../shared/models/TraceabilityEvent.js';
import { IncomingShipmentQueryDTO, OutgoingShipmentQueryDTO } from './dto/shipment.dto.js';
import { TraceabilityEventType } from '../../../shared/enums/TraceabilityEventType.js';

export class ShipmentRepository {
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
   * Find Incoming Shipments arriving FROM Farmers to Processor
   */
  async findIncomingShipments(
    processorId: string,
    query?: IncomingShipmentQueryDTO
  ): Promise<{ shipments: IShipment[]; total: number }> {
    const isObjId = mongoose.Types.ObjectId.isValid(processorId);
    const filter: any = {};

    if (isObjId) {
      filter.$or = [
        { processorId: new mongoose.Types.ObjectId(processorId) },
        { destination: new RegExp('Processor|Plant|Facility', 'i') },
      ];
    }

    const tab = query?.tab || 'pending';
    const subFilter = query?.subFilter || 'all';

    if (tab === 'pending') {
      filter.shipmentStatus = { $in: ['DISPATCHED', 'IN_TRANSIT', 'PREPARING'] };
    } else {
      // History tab
      if (subFilter === 'accepted') {
        filter.inspectionResult = 'PASSED';
      } else if (subFilter === 'rejected') {
        filter.inspectionResult = 'FAILED';
      } else {
        filter.shipmentStatus = { $in: ['DELIVERED', 'ACCEPTED', 'REJECTED', 'CANCELLED'] };
      }
    }

    if (query?.search && query.search.trim() !== '') {
      const sRegex = new RegExp(query.search.trim(), 'i');
      filter.$and = [
        {
          $or: [
            { shipmentId: sRegex },
            { batchId: sRegex },
            { cargoName: sRegex },
            { trackingNumber: sRegex },
          ],
        },
      ];
    }

    const total = await Shipment.countDocuments(filter);
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const shipments = await Shipment.find(filter)
      .populate('farmerId', 'fullName email phone farmerId role')
      .populate('processorId', 'fullName email phone processorId role')
      .populate('orderId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return { shipments, total };
  }

  /**
   * Find Outgoing Shipments sent TO Distributors by Processor
   */
  async findOutgoingShipments(
    processorId: string,
    query?: OutgoingShipmentQueryDTO
  ): Promise<{ shipments: IShipment[]; total: number }> {
    const isObjId = mongoose.Types.ObjectId.isValid(processorId);
    const filter: any = {};

    if (isObjId) {
      filter.$or = [
        { processorId: new mongoose.Types.ObjectId(processorId) },
        { farmerId: new mongoose.Types.ObjectId(processorId) },
      ];
    }

    const tab = query?.tab || 'active';
    const subFilter = query?.subFilter || 'all';

    if (tab === 'active') {
      filter.shipmentStatus = { $in: ['DISPATCHED', 'IN_TRANSIT', 'PREPARING'] };
    } else {
      // History tab
      if (subFilter === 'accepted') {
        filter.inspectionResult = 'PASSED';
      } else if (subFilter === 'rejected') {
        filter.inspectionResult = 'FAILED';
      } else {
        filter.shipmentStatus = { $in: ['DELIVERED', 'ACCEPTED', 'REJECTED', 'CANCELLED'] };
      }
    }

    if (query?.search && query.search.trim() !== '') {
      const sRegex = new RegExp(query.search.trim(), 'i');
      filter.$and = [
        {
          $or: [
            { shipmentId: sRegex },
            { batchId: sRegex },
            { cargoName: sRegex },
            { trackingNumber: sRegex },
          ],
        },
      ];
    }

    const total = await Shipment.countDocuments(filter);
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const shipments = await Shipment.find(filter)
      .populate('farmerId', 'fullName email phone farmerId role')
      .populate('processorId', 'fullName email phone processorId role')
      .populate('orderId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return { shipments, total };
  }

  /**
   * Calculate count totals across all shipment views
   */
  async countShipments(processorId: string) {
    const isObjId = mongoose.Types.ObjectId.isValid(processorId);
    const baseFilter = isObjId
      ? { $or: [{ processorId: new mongoose.Types.ObjectId(processorId) }, { farmerId: new mongoose.Types.ObjectId(processorId) }] }
      : {};

    const incomingPending = await Shipment.countDocuments({
      ...baseFilter,
      shipmentStatus: { $in: ['DISPATCHED', 'IN_TRANSIT', 'PREPARING'] },
    });

    const incomingHistoryAll = await Shipment.countDocuments({
      ...baseFilter,
      shipmentStatus: { $in: ['DELIVERED', 'ACCEPTED', 'REJECTED', 'CANCELLED'] },
    });

    const incomingHistoryAccepted = await Shipment.countDocuments({
      ...baseFilter,
      inspectionResult: 'PASSED',
    });

    const incomingHistoryRejected = await Shipment.countDocuments({
      ...baseFilter,
      inspectionResult: 'FAILED',
    });

    return {
      incomingPending,
      incomingHistoryAll,
      incomingHistoryAccepted,
      incomingHistoryRejected,
      outgoingActive: incomingPending,
      outgoingHistoryAll: incomingHistoryAll,
      outgoingHistoryAccepted: incomingHistoryAccepted,
      outgoingHistoryRejected: incomingHistoryRejected,
    };
  }

  /**
   * Find Shipment by ObjectId or Shipment ID
   */
  async findShipmentByIdOrNumber(idOrNumber: string): Promise<IShipment | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrNumber);
    const query = isObjectId
      ? { $or: [{ _id: new mongoose.Types.ObjectId(idOrNumber) }, { shipmentId: idOrNumber }] }
      : { shipmentId: idOrNumber };

    return Shipment.findOne(query)
      .populate('farmerId', 'fullName email phone farmerId role')
      .populate('processorId', 'fullName email phone processorId role')
      .populate('orderId')
      .exec();
  }

  /**
   * Update Shipment document
   */
  async updateShipment(shipmentId: string, updatePayload: any): Promise<IShipment | null> {
    return Shipment.findByIdAndUpdate(shipmentId, { $set: updatePayload }, { new: true }).exec();
  }

  /**
   * Find Order by ID
   */
  async findOrderById(orderId: string | mongoose.Types.ObjectId): Promise<IOrder | null> {
    return Order.findById(orderId).exec();
  }

  /**
   * Update Order document
   */
  async updateOrderStatus(
    orderId: string | mongoose.Types.ObjectId,
    orderStatus: string,
    deliveryStatus?: string,
    escrowStatus?: string
  ): Promise<IOrder | null> {
    const payload: any = { orderStatus };
    if (deliveryStatus) payload.deliveryStatus = deliveryStatus;
    if (escrowStatus) payload.escrowStatus = escrowStatus;

    return Order.findByIdAndUpdate(orderId, { $set: payload }, { new: true }).exec();
  }

  /**
   * Restore Harvest available volume
   */
  async restoreHarvestInventory(batchId: string, quantityKg: number): Promise<IHarvest | null> {
    return Harvest.findOneAndUpdate(
      { $or: [{ batchId }, { _id: mongoose.Types.ObjectId.isValid(batchId) ? batchId : null }] },
      { $inc: { availableVolume: quantityKg } },
      { new: true }
    ).exec();
  }

  /**
   * Update Harvest ownership to processor
   */
  async updateHarvestOwnership(batchId: string, processorUserId: mongoose.Types.ObjectId): Promise<IHarvest | null> {
    return Harvest.findOneAndUpdate(
      { $or: [{ batchId }, { _id: mongoose.Types.ObjectId.isValid(batchId) ? batchId : null }] },
      { $set: { listingStatus: 'SOLD_OUT' } },
      { new: true }
    ).exec();
  }

  /**
   * Update ProcessedProduct ownership
   */
  async updateProcessedProductOwnership(batchId: string, transferred: boolean): Promise<IProcessedProduct | null> {
    return ProcessedProduct.findOneAndUpdate(
      { $or: [{ batchId }, { processedProductId: batchId }] },
      { $set: { ownershipTransferred: transferred } },
      { new: true }
    ).exec();
  }

  /**
   * Update Farmer Wallet and record Transaction
   */
  async updateFarmerWalletAndAddTransaction(
    farmerId: mongoose.Types.ObjectId,
    amount: number,
    orderId: string,
    title: string,
    productName: string
  ): Promise<void> {
    await Wallet.findOneAndUpdate(
      { farmerId },
      { $inc: { balance: amount, totalRevenue: amount } },
      { upsert: true, new: true }
    ).exec();

    const txId = `WTX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const tx = new WalletTransaction({
      transactionId: txId,
      userId: farmerId,
      title,
      productName,
      counterparty: 'Processor Hub',
      counterpartyRole: 'Processor',
      orderId,
      amount: `+ ₹ ${amount.toLocaleString('en-IN')}`,
      rawAmount: amount,
      type: 'FARMER_PAYMENT',
      status: 'Escrow Released to Wallet',
    });
    await tx.save();
  }

  /**
   * Update Processor Wallet and record Transaction
   */
  async updateProcessorWalletAndAddTransaction(
    processorUserId: mongoose.Types.ObjectId,
    amount: number,
    orderId: string,
    title: string,
    productName: string,
    counterparty: string
  ): Promise<void> {
    await Wallet.findOneAndUpdate(
      { farmerId: processorUserId },
      { $inc: { balance: amount, totalRevenue: amount } },
      { upsert: true, new: true }
    ).exec();

    const txId = `WTX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const tx = new WalletTransaction({
      transactionId: txId,
      userId: processorUserId,
      title,
      productName,
      counterparty,
      counterpartyRole: 'Distributor',
      orderId,
      amount: `+ ₹ ${amount.toLocaleString('en-IN')}`,
      rawAmount: amount,
      type: 'DISTRIBUTOR',
      status: 'Escrow Released to Wallet',
    });
    await tx.save();
  }

  /**
   * Append a Traceability Event
   */
  async createTraceabilityEvent(
    batchId: string,
    eventType: TraceabilityEventType,
    performedBy: mongoose.Types.ObjectId,
    performedByRole: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const event = new TraceabilityEvent({
        batchId,
        eventType,
        performedBy,
        performedByRole,
        metadata,
        timestamp: new Date(),
      });
      await event.save();
    } catch (err) {
      console.warn('Failed to append traceability event:', err);
    }
  }
}

export const shipmentRepository = new ShipmentRepository();
