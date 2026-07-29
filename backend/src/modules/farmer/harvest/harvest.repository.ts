import mongoose from 'mongoose';
import Harvest, { IHarvest } from '../../../shared/models/Harvest.js';
import BatchLineage, { IBatchLineage } from '../../../shared/models/BatchLineage.js';
import TraceabilityEvent, { ITraceabilityEvent } from '../../../shared/models/TraceabilityEvent.js';
import User, { IUser } from '../../../shared/models/User.js';
import { HarvestStatus } from '../../../shared/enums/HarvestStatus.js';
import { HarvestQueryDTO } from './dto/harvest.dto.js';

export class HarvestRepository {
  async findUserById(userId: string): Promise<IUser | null> {
    if (!userId) return null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId).exec();
      if (user) return user;
    }
    return User.findOne({
      $or: [
        { farmerId: userId },
        { userId: userId },
        { phone: userId },
        { email: userId.toLowerCase() },
      ],
    }).exec();
  }

  async createHarvest(harvestData: Partial<IHarvest>): Promise<IHarvest> {
    const harvest = new Harvest(harvestData);
    return harvest.save();
  }

  async findHarvestById(harvestId: string): Promise<IHarvest | null> {
    if (mongoose.Types.ObjectId.isValid(harvestId)) {
      const found = await Harvest.findById(harvestId).exec();
      if (found) return found;
    }
    return Harvest.findOne({ batchId: harvestId }).exec();
  }

  async findHarvestByBatchId(batchId: string): Promise<IHarvest | null> {
    return Harvest.findOne({ batchId }).exec();
  }

  async findActiveHarvestsByFarmerId(
    user: IUser,
    query?: HarvestQueryDTO
  ): Promise<{ harvests: IHarvest[]; total: number }> {
    const filter: any = {
      farmerId: user._id,
      harvestStatus: HarvestStatus.ACTIVE,
    };

    if (query?.cropCategory) {
      filter.cropCategory = query.cropCategory;
    }

    if (query?.listingStatus) {
      filter.listingStatus = query.listingStatus;
    }

    if (query?.search && query.search.trim() !== '') {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$and = [
        {
          $or: [
            { cropName: regex },
            { cropVariety: regex },
            { batchId: regex },
            { cropCategory: regex },
          ],
        },
      ];
    }

    const total = await Harvest.countDocuments(filter);
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const harvests = await Harvest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return { harvests, total };
  }

  async findSoldHarvestsByFarmerId(
    user: IUser,
    query?: HarvestQueryDTO
  ): Promise<{ harvests: IHarvest[]; total: number }> {
    const filter: any = {
      farmerId: user._id,
      harvestStatus: HarvestStatus.SOLD,
    };

    if (query?.cropCategory) {
      filter.cropCategory = query.cropCategory;
    }

    if (query?.search && query.search.trim() !== '') {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$and = [
        {
          $or: [
            { cropName: regex },
            { cropVariety: regex },
            { batchId: regex },
            { cropCategory: regex },
          ],
        },
      ];
    }

    const total = await Harvest.countDocuments(filter);
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const harvests = await Harvest.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return { harvests, total };
  }

  async updateHarvest(harvestId: string, updateData: Partial<IHarvest>): Promise<IHarvest | null> {
    if (mongoose.Types.ObjectId.isValid(harvestId)) {
      const updated = await Harvest.findByIdAndUpdate(harvestId, { $set: updateData }, { new: true, runValidators: true }).exec();
      if (updated) return updated;
    }
    return Harvest.findOneAndUpdate({ batchId: harvestId }, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async deleteHarvest(harvestId: string): Promise<boolean> {
    let result;
    if (mongoose.Types.ObjectId.isValid(harvestId)) {
      result = await Harvest.findByIdAndDelete(harvestId).exec();
    } else {
      result = await Harvest.findOneAndDelete({ batchId: harvestId }).exec();
    }
    return !!result;
  }

  async createTraceabilityEvent(eventData: Partial<ITraceabilityEvent>): Promise<ITraceabilityEvent> {
    const event = new TraceabilityEvent(eventData);
    return event.save();
  }

  async findChildBatches(parentBatchId: string): Promise<IBatchLineage[]> {
    return BatchLineage.find({ parentBatchId }).exec();
  }
}

export const harvestRepository = new HarvestRepository();
