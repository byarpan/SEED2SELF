import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  adminEmail?: string;
  action: string;
  targetType: 'USER' | 'KYC' | 'ORDER' | 'SHIPMENT' | 'SUPPORT_TICKET' | 'PAYMENT' | 'SYSTEM';
  targetId?: string;
  details: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema: Schema = new Schema<IAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    adminEmail: { type: String },
    action: { type: String, required: true },
    targetType: {
      type: String,
      enum: ['USER', 'KYC', 'ORDER', 'SHIPMENT', 'SUPPORT_TICKET', 'PAYMENT', 'SYSTEM'],
      required: true,
    },
    targetId: { type: String },
    details: { type: String, required: true },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
