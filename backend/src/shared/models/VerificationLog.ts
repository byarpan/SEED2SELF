import mongoose, { Schema, Document } from 'mongoose';

export interface IVerificationLog extends Document {
  _id: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: string;
  previousStatus: string;
  newStatus: string;
  notes?: string;
  rejectionReason?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationLogSchema: Schema = new Schema<IVerificationLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, required: true },
    previousStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    notes: { type: String },
    rejectionReason: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const VerificationLog =
  mongoose.models.VerificationLog || mongoose.model<IVerificationLog>('VerificationLog', VerificationLogSchema);
export default VerificationLog;
