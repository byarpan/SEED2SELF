import mongoose from 'mongoose';
import User, { IUser } from '../../../shared/models/User.js';
import Address, { IAddress } from '../../../shared/models/Address.js';
import KYC, { IKYC } from '../../../shared/models/KYC.js';
import BankAccount, { IBankAccount } from '../../../shared/models/BankAccount.js';
import { KYCVerificationStatus } from '../../../shared/enums/KYCVerificationStatus.js';
import { UpdateAddressDTO, UpdateKYCDTO, BankAccountDTO } from './dto/profile.dto.js';

export class ProfileRepository {
  async findUserById(userId: string): Promise<IUser | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(userId);
    if (isObjectId) {
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

  async findUserByEmailOrPhone(email?: string, phone?: string, excludeUserId?: string): Promise<IUser | null> {
    const conditions: any[] = [];
    if (email && email.trim() !== '') conditions.push({ email: email.toLowerCase().trim() });
    if (phone && phone.trim() !== '') conditions.push({ phone: phone.trim() });
    if (conditions.length === 0) return null;

    const query: any = { $or: conditions };
    if (excludeUserId && mongoose.Types.ObjectId.isValid(excludeUserId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeUserId) };
    }

    return User.findOne(query).exec();
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async findAddressByUserId(userId: string): Promise<IAddress | null> {
    return Address.findOne({ userId }).exec();
  }

  async upsertAddress(userId: string, addressData: UpdateAddressDTO): Promise<IAddress> {
    return Address.findOneAndUpdate(
      { userId },
      { $set: { userId, ...addressData } },
      { new: true, upsert: true, runValidators: true }
    ).exec();
  }

  async findKYCByUserId(userId: string): Promise<IKYC | null> {
    return KYC.findOne({ userId }).exec();
  }

  async upsertKYC(userId: string, kycData: UpdateKYCDTO): Promise<IKYC> {
    return KYC.findOneAndUpdate(
      { userId },
      { $set: { userId, ...kycData, verificationStatus: KYCVerificationStatus.PENDING } },
      { new: true, upsert: true, runValidators: true }
    ).exec();
  }

  async findBankAccountByUserId(userId: string): Promise<IBankAccount | null> {
    return BankAccount.findOne({ userId }).exec();
  }

  async upsertBankAccount(userId: string, bankData: BankAccountDTO): Promise<IBankAccount> {
    return BankAccount.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          bankName: bankData.bankName.trim(),
          accountHolderName: bankData.accountHolderName.trim(),
          accountNumber: bankData.accountNumber.trim(),
          ifscCode: bankData.ifscCode.toUpperCase().trim(),
          branchLocation: bankData.branchLocation?.trim() || 'Main Branch',
          isVerified: true,
        },
      },
      { new: true, upsert: true, runValidators: true }
    ).exec();
  }
}

export const profileRepository = new ProfileRepository();
