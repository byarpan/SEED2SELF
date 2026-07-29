import Shipment, { IShipment } from '../../../shared/models/Shipment.js';
import Order, { IOrder } from '../../../shared/models/Order.js';
import Harvest, { IHarvest } from '../../../shared/models/Harvest.js';
import Payment, { IPayment } from '../../../shared/models/Payment.js';
import Escrow, { IEscrow } from '../../../shared/models/Escrow.js';
import Wallet, { IWallet } from '../../../shared/models/Wallet.js';
import Invoice, { IInvoice } from '../../../shared/models/Invoice.js';
import User, { IUser } from '../../../shared/models/User.js';
import TraceabilityEvent, { ITraceabilityEvent } from '../../../shared/models/TraceabilityEvent.js';
import { ShipmentQueryDTO } from './dto/shipment.dto.js';
import mongoose from 'mongoose';

export class ShipmentRepository {
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

  async createShipment(shipmentData: Partial<IShipment>): Promise<IShipment> {
    const shipment = new Shipment(shipmentData);
    return shipment.save();
  }

  async findShipmentById(id: string): Promise<IShipment | null> {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const found = await Shipment.findById(id).exec();
      if (found) return found;
    }
    return Shipment.findOne({ shipmentId: id }).exec();
  }

  async findShipmentByShipmentId(shipmentId: string): Promise<IShipment | null> {
    return Shipment.findOne({ shipmentId }).exec();
  }

  async findShipmentByOrderId(orderId: string): Promise<IShipment | null> {
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      const found = await Shipment.findOne({ orderId }).exec();
      if (found) return found;
    }
    return Shipment.findOne({ orderId }).exec();
  }

  async findShipmentsByFarmerId(
    user: IUser,
    statusFilter?: string[],
    query?: ShipmentQueryDTO
  ): Promise<{ shipments: IShipment[]; total: number }> {
    const filter: any = {
      $or: [
        { farmerId: user._id },
      ],
    };

    if (statusFilter && statusFilter.length > 0) {
      filter.shipmentStatus = { $in: statusFilter };
    }

    if (query?.search && query.search.trim() !== '') {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$and = [
        {
          $or: [
            { shipmentId: regex },
            { batchId: regex },
            { cargoName: regex },
            { destination: regex },
            { trackingNumber: regex },
          ],
        },
      ];
    }

    const total = await Shipment.countDocuments(filter);
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const shipments = await Shipment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return { shipments, total };
  }

  async updateShipment(id: string, updateData: Partial<IShipment>): Promise<IShipment | null> {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const updated = await Shipment.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).exec();
      if (updated) return updated;
    }
    return Shipment.findOneAndUpdate({ shipmentId: id }, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async findOrderById(orderId: string): Promise<IOrder | null> {
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      const found = await Order.findById(orderId).exec();
      if (found) return found;
    }
    return Order.findOne({ orderNumber: orderId }).exec();
  }

  async updateOrder(orderId: string, updateData: Partial<IOrder>): Promise<IOrder | null> {
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      const updated = await Order.findByIdAndUpdate(orderId, { $set: updateData }, { new: true, runValidators: true }).exec();
      if (updated) return updated;
    }
    return Order.findOneAndUpdate({ orderNumber: orderId }, { $set: updateData }, { new: true, runValidators: true }).exec();
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

  async findPaymentByOrderId(orderId: string): Promise<IPayment | null> {
    return Payment.findOne({ orderId }).exec();
  }

  async updatePayment(paymentId: string, updateData: Partial<IPayment>): Promise<IPayment | null> {
    if (mongoose.Types.ObjectId.isValid(paymentId)) {
      const updated = await Payment.findByIdAndUpdate(paymentId, { $set: updateData }, { new: true, runValidators: true }).exec();
      if (updated) return updated;
    }
    return Payment.findOneAndUpdate({ paymentId }, { $set: updateData }, { new: true, runValidators: true }).exec();
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

  async findOrCreateWallet(farmerId: string): Promise<IWallet> {
    const isObjectId = mongoose.Types.ObjectId.isValid(farmerId);
    let wallet;
    if (isObjectId) {
      wallet = await Wallet.findOne({ farmerId }).exec();
    }
    if (!wallet) {
      const user = await this.findUserById(farmerId);
      if (user) {
        wallet = await Wallet.findOne({ farmerId: user._id }).exec();
      }
    }

    if (!wallet) {
      const targetId = isObjectId ? new mongoose.Types.ObjectId(farmerId) : (await this.findUserById(farmerId))?._id;
      if (!targetId) throw new Error('User not found to create wallet');

      wallet = await Wallet.create({
        farmerId: targetId,
        balance: 0,
        totalRevenue: 0,
        pendingEscrow: 0,
        withdrawn: 0,
      });
    }
    return wallet;
  }

  async updateWallet(walletId: string, updateData: Partial<IWallet>): Promise<IWallet | null> {
    return Wallet.findByIdAndUpdate(walletId, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async createInvoice(invoiceData: Partial<IInvoice>): Promise<IInvoice> {
    const invoice = new Invoice(invoiceData);
    return invoice.save();
  }

  async createTraceabilityEvent(eventData: Partial<ITraceabilityEvent>): Promise<ITraceabilityEvent> {
    const event = new TraceabilityEvent(eventData);
    return event.save();
  }
}

export const shipmentRepository = new ShipmentRepository();
