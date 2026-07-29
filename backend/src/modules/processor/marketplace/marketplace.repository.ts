import mongoose from 'mongoose';
import User, { IUser } from '../../../shared/models/User.js';
import Harvest, { IHarvest } from '../../../shared/models/Harvest.js';
import Farm from '../../../shared/models/Farm.js';
import ProcessorFactory, { IProcessorFactory } from '../../../shared/models/ProcessorFactory.js';
import Order, { IOrder } from '../../../shared/models/Order.js';
import Payment, { IPayment } from '../../../shared/models/Payment.js';
import Escrow, { IEscrow } from '../../../shared/models/Escrow.js';
import { CreateFactoryDTO, UpdateFactoryDTO } from './dto/marketplace.dto.js';
import { ListingStatus } from '../../../shared/enums/ListingStatus.js';
import { HarvestStatus } from '../../../shared/enums/HarvestStatus.js';

export class ProcessorMarketplaceRepository {
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

    // Fallback: If no user found in DB (e.g. demo mode / demo-processor-id), return or create default processor user
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
   * Only return harvest batches that are:
   * - Published (listingStatus == LISTED)
   * - Active (harvestStatus == ACTIVE)
   * - Remaining Volume > 0
   */
  async findAvailableHarvests(search?: string, category?: string): Promise<any[]> {
    const query: any = {
      availableVolume: { $gt: 0 },
      listingStatus: ListingStatus.LISTED,
      harvestStatus: HarvestStatus.ACTIVE,
    };

    if (category && category.trim() !== '') {
      query.cropCategory = new RegExp(category.trim(), 'i');
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      const qRegex = new RegExp(q, 'i');

      const matchingFarmers = await User.find({ fullName: qRegex }).select('_id').exec();
      const farmerIds = matchingFarmers.map((f) => f._id);

      const matchingFarms = await Farm.find({
        $or: [{ farmName: qRegex }, { district: qRegex }, { state: qRegex }, { village: qRegex }],
      })
        .select('_id')
        .exec();
      const farmIds = matchingFarms.map((f) => f._id);

      query.$or = [
        { cropName: qRegex },
        { batchId: qRegex },
        { farmerId: { $in: farmerIds } },
        { farmId: { $in: farmIds } },
      ];
    }

    return Harvest.find(query)
      .populate('farmerId', 'fullName email phone')
      .populate('farmId', 'farmName village district state')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findHarvestById(id: string): Promise<any | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { $or: [{ _id: id }, { batchId: id }] } : { batchId: id };

    return Harvest.findOne(query)
      .populate('farmerId', 'fullName email phone')
      .populate('farmId', 'farmName village district state')
      .exec();
  }

  /**
   * ATOMIC INVENTORY RESERVATION (Concurrency Protection):
   * Decrements availableVolume atomically ONLY if availableVolume >= requestedQuantity.
   */
  async reserveHarvestInventory(harvestId: string, requestedQuantity: number): Promise<IHarvest | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(harvestId);
    const filter = isObjectId
      ? { _id: new mongoose.Types.ObjectId(harvestId), availableVolume: { $gte: requestedQuantity } }
      : { batchId: harvestId, availableVolume: { $gte: requestedQuantity } };

    return Harvest.findOneAndUpdate(
      filter,
      { $inc: { availableVolume: -requestedQuantity } },
      { new: true }
    ).exec();
  }

  /**
   * Restore reserved inventory if checkout/payment fails
   */
  async restoreHarvestInventory(harvestId: string, quantityToRestore: number): Promise<IHarvest | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(harvestId);
    const filter = isObjectId ? { _id: new mongoose.Types.ObjectId(harvestId) } : { batchId: harvestId };

    return Harvest.findOneAndUpdate(
      filter,
      { $inc: { availableVolume: quantityToRestore } },
      { new: true }
    ).exec();
  }

  // Factory Delivery Locations with Ownership Validation
  async findProcessorFactories(userId: string): Promise<IProcessorFactory[]> {
    return ProcessorFactory.find({ processorId: new mongoose.Types.ObjectId(userId) })
      .sort({ isDefault: -1, createdAt: -1 })
      .exec();
  }

  async findFactoryById(factoryId: string, userId: string): Promise<IProcessorFactory | null> {
    if (!mongoose.Types.ObjectId.isValid(factoryId)) {
      return null;
    }
    return ProcessorFactory.findOne({
      _id: new mongoose.Types.ObjectId(factoryId),
      processorId: new mongoose.Types.ObjectId(userId),
    }).exec();
  }

  async findFactoryAnyOwner(factoryId: string): Promise<IProcessorFactory | null> {
    if (!mongoose.Types.ObjectId.isValid(factoryId)) {
      return null;
    }
    return ProcessorFactory.findById(factoryId).exec();
  }

  async createFactory(userId: string, data: CreateFactoryDTO): Promise<IProcessorFactory> {
    const factory = new ProcessorFactory({
      processorId: new mongoose.Types.ObjectId(userId),
      factoryName: data.factoryName,
      contactPerson: data.contactPerson,
      contactNumber: data.contactNumber,
      streetAddress: data.streetAddress,
      city: data.city,
      state: data.state,
      pinCode: data.pinCode,
      country: data.country || 'India',
      latitude: data.latitude,
      longitude: data.longitude,
      googleMapsUrl: data.googleMapsUrl,
      isDefault: data.isDefault || false,
    });
    return factory.save();
  }

  async updateFactory(
    factoryId: string,
    userId: string,
    data: UpdateFactoryDTO
  ): Promise<IProcessorFactory | null> {
    if (!mongoose.Types.ObjectId.isValid(factoryId)) {
      return null;
    }
    return ProcessorFactory.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(factoryId),
        processorId: new mongoose.Types.ObjectId(userId),
      },
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  }

  async deleteFactory(factoryId: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(factoryId)) {
      return false;
    }
    const res = await ProcessorFactory.deleteOne({
      _id: new mongoose.Types.ObjectId(factoryId),
      processorId: new mongoose.Types.ObjectId(userId),
    }).exec();
    return res.deletedCount > 0;
  }

  async findOrderById(orderId: string): Promise<any | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
    const query = isObjectId ? { $or: [{ _id: orderId }, { orderNumber: orderId }] } : { orderNumber: orderId };

    const order = await Order.findOne(query)
      .populate('farmerId', 'fullName phone email')
      .populate('processorId', 'fullName phone email')
      .exec();

    if (!order) return null;

    const escrow = await Escrow.findOne({ orderId: order.orderNumber }).exec();
    const payment = await Payment.findOne({ orderId: order._id }).exec();

    return {
      order,
      escrow,
      payment,
    };
  }
}

export const processorMarketplaceRepository = new ProcessorMarketplaceRepository();
