import mongoose from 'mongoose';
import User, { IUser } from '../../../shared/models/User.js';
import ProcessorAddress, { IProcessorAddress } from '../../../shared/models/ProcessorAddress.js';
import ProcessorKYC, { IProcessorKYC } from '../../../shared/models/ProcessorKYC.js';
import Review, { IReview } from '../../../shared/models/Review.js';
import { KYCVerificationStatus } from '../../../shared/enums/KYCVerificationStatus.js';
import {
  UpdateProcessorAddressDTO,
  UpdateProcessorKYCDTO,
  AddReviewDTO,
} from './dto/processor-profile.dto.js';

export class ProcessorProfileRepository {
  async findUserByIdOrProcessorId(identifier: string): Promise<IUser | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    if (isObjectId) {
      const user = await User.findById(identifier).exec();
      if (user) return user;
    }
    return User.findOne({
      $or: [
        { processorId: identifier },
        { userId: identifier },
        { email: identifier.toLowerCase() },
      ],
    }).exec();
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }

  async findAddressByUserId(userId: string): Promise<IProcessorAddress | null> {
    return ProcessorAddress.findOne({ userId }).exec();
  }

  async upsertAddress(
    userId: string,
    addressData: UpdateProcessorAddressDTO
  ): Promise<IProcessorAddress> {
    return ProcessorAddress.findOneAndUpdate(
      { userId },
      { $set: { userId, ...addressData } },
      { new: true, upsert: true, runValidators: true }
    ).exec();
  }

  async findKYCByUserId(userId: string): Promise<IProcessorKYC | null> {
    return ProcessorKYC.findOne({ userId }).exec();
  }

  async upsertKYC(userId: string, kycData: UpdateProcessorKYCDTO): Promise<IProcessorKYC> {
    return ProcessorKYC.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          ...kycData,
          verificationStatus: KYCVerificationStatus.PENDING,
        },
      },
      { new: true, upsert: true, runValidators: true }
    ).exec();
  }

  async findReviewsByTargetUserId(targetUserId: string): Promise<IReview[]> {
    return Review.find({ targetUserId })
      .populate('reviewerId', 'fullName profilePhoto role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async createReview(data: AddReviewDTO & { targetUserId: string }): Promise<IReview> {
    const review = new Review({
      targetUserId: data.targetUserId,
      reviewerId: data.reviewerId,
      rating: data.rating,
      comment: data.comment || '',
    });
    return review.save();
  }

  async recalculateRatings(targetUserId: string): Promise<{ averageRating: number; reviewCount: number }> {
    const aggregateResult = await Review.aggregate([
      { $match: { targetUserId: new mongoose.Types.ObjectId(targetUserId) } },
      {
        $group: {
          _id: '$targetUserId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]).exec();

    let averageRating = 0;
    let reviewCount = 0;

    if (aggregateResult.length > 0) {
      averageRating = Math.round(aggregateResult[0].avgRating * 10) / 10;
      reviewCount = aggregateResult[0].count;
    }

    await User.findByIdAndUpdate(targetUserId, {
      $set: { averageRating, reviewCount },
    }).exec();

    return { averageRating, reviewCount };
  }
}

export const processorProfileRepository = new ProcessorProfileRepository();
