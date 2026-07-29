import mongoose from 'mongoose';
import User, { IUser } from '../../../shared/models/User.js';
import Farm, { IFarm } from '../../../shared/models/Farm.js';
import { UpdateFarmDetailsDTO } from './dto/dashboard.dto.js';
import { resolveUser, resolveUserId } from '../../../shared/utils/userResolver.js';

export class DashboardRepository {
  async findUserById(userId: string): Promise<IUser | null> {
    return resolveUser(userId);
  }

  async findFarmByUserId(userId: string): Promise<IFarm | null> {
    const userObjId = await resolveUserId(userId);
    if (userObjId) {
      const farm = await Farm.findOne({ $or: [{ userId: userObjId }, { userId }] }).exec();
      if (farm) return farm;
    }
    return Farm.findOne({ userId }).exec();
  }

  async upsertFarm(userId: string, farmData: UpdateFarmDetailsDTO): Promise<IFarm> {
    const user = await this.findUserById(userId);
    const targetUserId = user ? user._id : userId;
    return Farm.findOneAndUpdate(
      { userId: targetUserId },
      { $set: { userId: targetUserId, ...farmData } },
      { new: true, upsert: true, runValidators: true }
    ).exec();
  }
}

export const dashboardRepository = new DashboardRepository();
