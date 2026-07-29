import mongoose from 'mongoose';
import ProcessedProduct, { IProcessedProduct } from '../../../shared/models/ProcessedProduct.js';
import ProcessingRun, { IProcessingRun } from '../../../shared/models/ProcessingRun.js';
import Shipment, { IShipment } from '../../../shared/models/Shipment.js';
import Order, { IOrder } from '../../../shared/models/Order.js';
import Escrow, { IEscrow } from '../../../shared/models/Escrow.js';
import User, { IUser } from '../../../shared/models/User.js';

export class ReportsRepository {
  /**
   * Resolve Processor User
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

    // Fallback default processor user
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
        });
      } catch (err) {
        return {
          _id: new mongoose.Types.ObjectId('65f1a2b3c4d5e6f7a8b9c0d1'),
          processorId: 'PRC-DEMO-001',
          role: 'PROCESSOR',
          fullName: 'Central Grain Processing Plant',
          email: 'processor@seed2shelf.com',
        } as any;
      }
    }
    return defaultUser;
  }

  /**
   * Find Shipments in date range for processor
   */
  async findShipmentsInDateRange(
    processorUserId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<IShipment[]> {
    return Shipment.find({
      $or: [{ processorId: processorUserId }, { farmerId: processorUserId }],
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate('orderId')
      .exec();
  }

  /**
   * Find Orders in date range for processor
   */
  async findOrdersInDateRange(
    processorUserId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<IOrder[]> {
    return Order.find({
      $or: [{ processorId: processorUserId }, { farmerId: processorUserId }],
      createdAt: { $gte: startDate, $lte: endDate },
    }).exec();
  }

  /**
   * Find Escrows for processor
   */
  async findEscrowsInDateRange(
    processorUserId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<IEscrow[]> {
    return Escrow.find({
      $or: [{ userId: processorUserId }, { payeeId: processorUserId }],
      createdAt: { $gte: startDate, $lte: endDate },
    }).exec();
  }

  /**
   * Find ProcessedProducts
   */
  async findProcessedProducts(processorUserId: mongoose.Types.ObjectId): Promise<IProcessedProduct[]> {
    return ProcessedProduct.find({ processorId: processorUserId }).exec();
  }

  /**
   * Find ProcessingRuns
   */
  async findProcessingRuns(
    processorUserId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<IProcessingRun[]> {
    return ProcessingRun.find({
      processorId: processorUserId,
      createdAt: { $gte: startDate, $lte: endDate },
    }).exec();
  }
}

export const reportsRepository = new ReportsRepository();
