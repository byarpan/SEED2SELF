import mongoose, { Schema, Document } from 'mongoose';

export interface IProcessedProduct extends Document {
  _id: mongoose.Types.ObjectId;
  processedProductId: string;
  batchId: string;
  parentBatchId: string;
  processorId: mongoose.Types.ObjectId;
  factoryId?: mongoose.Types.ObjectId;
  productCategory: string;
  productName: string;
  processedQuantity: number;
  availableQuantity: number;
  unit: string;
  sellingPrice: number;
  processingDate: Date;
  productImage: string;
  listingStatus: 'IN_STOCK' | 'LISTED' | 'SOLD_OUT';
  processingStatus: 'COMPLETED' | 'IN_PROCESSING';
  ownershipTransferred: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProcessedProductSchema: Schema = new Schema<IProcessedProduct>(
  {
    processedProductId: { type: String, required: true, unique: true, index: true, trim: true },
    batchId: { type: String, required: true, unique: true, index: true, trim: true },
    parentBatchId: { type: String, default: 'NONE', index: true, trim: true },
    processorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    factoryId: { type: Schema.Types.ObjectId, ref: 'ProcessorFactory' },
    productCategory: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    processedQuantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg', trim: true },
    sellingPrice: { type: Number, required: true, min: 0 },
    processingDate: { type: Date, required: true, default: Date.now },
    productImage: { type: String, required: true, trim: true },
    listingStatus: {
      type: String,
      enum: ['IN_STOCK', 'LISTED', 'SOLD_OUT'],
      default: 'IN_STOCK',
      index: true,
    },
    processingStatus: {
      type: String,
      enum: ['COMPLETED', 'IN_PROCESSING'],
      default: 'COMPLETED',
      index: true,
    },
    ownershipTransferred: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

ProcessedProductSchema.index({ processorId: 1, listingStatus: 1, ownershipTransferred: 1 });

export const ProcessedProduct =
  mongoose.models.ProcessedProduct || mongoose.model<IProcessedProduct>('ProcessedProduct', ProcessedProductSchema);
export default ProcessedProduct;
