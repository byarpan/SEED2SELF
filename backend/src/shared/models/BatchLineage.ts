import mongoose, { Schema, Document } from 'mongoose';

export interface IBatchLineage extends Document {
  _id: mongoose.Types.ObjectId;
  parentBatchId: string;
  childBatchId: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BatchLineageSchema: Schema = new Schema<IBatchLineage>(
  {
    parentBatchId: { type: String, required: true, index: true, trim: true },
    childBatchId: { type: String, required: true, unique: true, index: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  {
    timestamps: true,
  }
);

BatchLineageSchema.index({ parentBatchId: 1, childBatchId: 1 });

export const BatchLineage = mongoose.models.BatchLineage || mongoose.model<IBatchLineage>('BatchLineage', BatchLineageSchema);
export default BatchLineage;
