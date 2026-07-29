import mongoose, { Schema, Document } from 'mongoose';
import { KYCVerificationStatus } from '../enums/KYCVerificationStatus.js';

export interface ICloudinaryImage {
  url: string;
  publicId: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: string;
  farmerId?: string;
  processorId?: string;
  adminId?: string;
  fullName: string;
  email?: string;
  phone: string;
  password?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: Date;
  role: 'FARMER' | 'PROCESSOR' | 'DISTRIBUTOR' | 'RETAILER' | 'CUSTOMER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
  profilePhoto?: string;
  profileImage?: ICloudinaryImage;
  aadhaarNumber?: string;
  aadhaarFront?: string;
  aadhaarBack?: string;
  verificationStatus: KYCVerificationStatus;
  averageRating: number;
  reviewCount: number;
  addressId?: mongoose.Types.ObjectId;
  kycId?: mongoose.Types.ObjectId;
  walletId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CloudinaryImageSchema = new Schema<ICloudinaryImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const UserSchema: Schema = new Schema<IUser>(
  {
    userId: { type: String, sparse: true, index: true },
    farmerId: { type: String, unique: true, sparse: true, index: true },
    processorId: { type: String, unique: true, sparse: true, index: true },
    adminId: { type: String, unique: true, sparse: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, select: false },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    dateOfBirth: { type: Date },
    role: {
      type: String,
      enum: ['FARMER', 'PROCESSOR', 'DISTRIBUTOR', 'RETAILER', 'CUSTOMER', 'ADMIN'],
      default: 'FARMER',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'DISABLED'],
      default: 'ACTIVE',
    },
    profilePhoto: { type: String },
    profileImage: { type: CloudinaryImageSchema },
    aadhaarNumber: { type: String },
    aadhaarFront: { type: String },
    aadhaarBack: { type: String },
    verificationStatus: {
      type: String,
      enum: Object.values(KYCVerificationStatus),
      default: KYCVerificationStatus.PENDING,
    },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    addressId: { type: Schema.Types.ObjectId, ref: 'Address' },
    kycId: { type: Schema.Types.ObjectId, ref: 'KYC' },
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet' },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
