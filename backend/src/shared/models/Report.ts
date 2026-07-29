import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  _id: mongoose.Types.ObjectId;
  reportNumber: string;
  reporterId: mongoose.Types.ObjectId;
  reporterRole: string;
  reporterName: string;
  reportType: 'USER' | 'ORDER' | 'PRODUCT' | 'SHIPMENT' | 'FRAUD' | 'SYSTEM';
  targetId: string;
  targetName?: string;
  subject: string;
  description: string;
  status: 'PENDING' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'DISMISSED';
  resolutionNotes?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema<IReport>(
  {
    reportNumber: { type: String, required: true, unique: true, index: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reporterRole: { type: String, required: true },
    reporterName: { type: String, required: true },
    reportType: {
      type: String,
      enum: ['USER', 'ORDER', 'PRODUCT', 'SHIPMENT', 'FRAUD', 'SYSTEM'],
      required: true,
      index: true,
    },
    targetId: { type: String, required: true, index: true },
    targetName: { type: String },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED'],
      default: 'PENDING',
      index: true,
    },
    resolutionNotes: { type: String, trim: true },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const Report = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
export default Report;
