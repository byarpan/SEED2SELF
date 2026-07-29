import mongoose, { Schema, Document } from 'mongoose';
import { KYCVerificationStatus } from '../enums/KYCVerificationStatus.js';

export interface ICloudinaryDocument {
  url: string;
  publicId: string;
}

export interface IKYC extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  aadhaarNumber: string;
  panNumber?: string;
  frontImage: string;
  backImage: string;
  frontDocument?: ICloudinaryDocument;
  backDocument?: ICloudinaryDocument;
  verificationStatus: KYCVerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const CloudinaryDocumentSchema = new Schema<ICloudinaryDocument>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const KYCSchema: Schema = new Schema<IKYC>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    aadhaarNumber: { type: String, required: true, trim: true },
    panNumber: { type: String, trim: true, uppercase: true },
    frontImage: { type: String, required: true },
    backImage: { type: String, required: true },
    frontDocument: { type: CloudinaryDocumentSchema },
    backDocument: { type: CloudinaryDocumentSchema },
    verificationStatus: {
      type: String,
      enum: Object.values(KYCVerificationStatus),
      default: KYCVerificationStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

export const KYC = mongoose.models.KYC || mongoose.model<IKYC>('KYC', KYCSchema);
export default KYC;
