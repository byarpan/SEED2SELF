import mongoose, { Schema, Document } from 'mongoose';

export interface IVariantAnalytics {
  variantName: string;
  qty: string;
  earnings: string;
  rawEarnings: number;
}

export interface IProcessedProductAnalytics extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  processorId?: string;
  name: string;
  image?: string;
  totalRevenue: string;
  rawTotalRevenue: number;
  totalBatches: number;
  variants: IVariantAnalytics[];
  createdAt: Date;
  updatedAt: Date;
}

const ProcessedProductAnalyticsSchema: Schema = new Schema<IProcessedProductAnalytics>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    processorId: { type: String, index: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    totalRevenue: { type: String, required: true },
    rawTotalRevenue: { type: Number, required: true, default: 0 },
    totalBatches: { type: Number, required: true, default: 0 },
    variants: [
      {
        variantName: { type: String, required: true },
        qty: { type: String, required: true },
        earnings: { type: String, required: true },
        rawEarnings: { type: Number, required: true, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

export const ProcessedProductAnalytics =
  mongoose.models.ProcessedProductAnalytics ||
  mongoose.model<IProcessedProductAnalytics>(
    'ProcessedProductAnalytics',
    ProcessedProductAnalyticsSchema
  );

export default ProcessedProductAnalytics;
