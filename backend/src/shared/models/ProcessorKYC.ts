import mongoose, { Schema, Document } from 'mongoose';
import { KYCVerificationStatus } from '../enums/KYCVerificationStatus.js';

export interface IProcessorKYC extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  documentType: string;
  aadhaarNumber?: string;
  frontImage?: string;
  backImage?: string;
  verificationStatus: KYCVerificationStatus;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const ProcessorKYCSchema: Schema = new Schema<IProcessorKYC>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    documentType: { type: String, default: 'AADHAAR' },
    aadhaarNumber: { type: String, trim: true, default: '' },
    frontImage: { type: String, trim: true, default: '' },
    backImage: { type: String, trim: true, default: '' },
    verificationStatus: {
      type: String,
      enum: Object.values(KYCVerificationStatus),
      default: KYCVerificationStatus.PENDING,
    },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

export const ProcessorKYC =
  mongoose.models.ProcessorKYC ||
  mongoose.model<IProcessorKYC>('ProcessorKYC', ProcessorKYCSchema);

export default ProcessorKYC;
