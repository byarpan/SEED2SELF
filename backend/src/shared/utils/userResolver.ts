import mongoose from 'mongoose';
import User, { IUser } from '../models/User.js';

export async function resolveUser(userId: string): Promise<IUser | null> {
  if (!userId) return null;
  const trimmed = userId.trim();
  
  // 1. Check if valid MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(trimmed)) {
    const u = await User.findById(trimmed).exec();
    if (u) return u;
  }
  
  // 2. Query by farmerId, processorId, adminId, email, phone, or custom/UUID fields
  const user = await User.findOne({
    $or: [
      { farmerId: trimmed },
      { processorId: trimmed },
      { adminId: trimmed },
      { userId: trimmed },
      { id: trimmed },
      { email: trimmed.toLowerCase() },
      { phone: trimmed }
    ]
  }).exec();

  if (user) return user;

  // 3. Fallback: if no matching user document exists yet in MongoDB Atlas, return null
  return null;
}

export async function resolveUserId(userId: string): Promise<mongoose.Types.ObjectId | null> {
  const u = await resolveUser(userId);
  return u ? (u._id as mongoose.Types.ObjectId) : null;
}
