import mongoose, { Schema, Document } from 'mongoose';

export interface IProcessingRun extends Document {
  _id: mongoose.Types.ObjectId;
  processingRunId: string;
  processorId: mongoose.Types.ObjectId;
  parentBatchId: string;
  childBatchId: string;
  processedProductId?: mongoose.Types.ObjectId;
  inputQuantity: number;
  outputQuantity: number;
  processingDate: Date;
  processingStatus: 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProcessingRunSchema: Schema = new Schema<IProcessingRun>(
  {
    processingRunId: { type: String, required: true, unique: true, index: true, trim: true },
    processorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parentBatchId: { type: String, required: true, index: true, trim: true },
    childBatchId: { type: String, required: true, index: true, trim: true },
    processedProductId: { type: Schema.Types.ObjectId, ref: 'ProcessedProduct' },
    inputQuantity: { type: Number, required: true, min: 0 },
    outputQuantity: { type: Number, required: true, min: 0 },
    processingDate: { type: Date, required: true, default: Date.now },
    processingStatus: {
      type: String,
      enum: ['COMPLETED', 'IN_PROGRESS', 'CANCELLED'],
      default: 'COMPLETED',
      index: true,
    },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

ProcessingRunSchema.index({ processorId: 1, processingStatus: 1 });

export const ProcessingRun =
  mongoose.models.ProcessingRun || mongoose.model<IProcessingRun>('ProcessingRun', ProcessingRunSchema);
export default ProcessingRun;
