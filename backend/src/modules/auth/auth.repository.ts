import mongoose from 'mongoose';
import User, { IUser } from '../../shared/models/User.js';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<IUser | null> {
    if (!email) return null;
    return User.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findUserByPhone(phone: string): Promise<IUser | null> {
    if (!phone) return null;
    return User.findOne({ phone: phone.trim() }).exec();
  }

  async findUserByIdentifier(identifier: string): Promise<IUser | null> {
    const cleanStr = identifier.trim();
    const queryConditions: any[] = [
      { email: cleanStr.toLowerCase() },
      { phone: cleanStr },
      { farmerId: cleanStr },
      { processorId: cleanStr },
      { userId: cleanStr },
    ];

    if (mongoose.Types.ObjectId.isValid(cleanStr)) {
      queryConditions.push({ _id: new mongoose.Types.ObjectId(cleanStr) });
    }

    return User.findOne({ $or: queryConditions }).select('+password').exec();
  }

  async findUserById(id: string): Promise<IUser | null> {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return User.findById(id).exec();
    }
    return User.findOne({
      $or: [{ farmerId: id }, { processorId: id }, { userId: id }],
    }).exec();
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }
}

export const authRepository = new AuthRepository();
