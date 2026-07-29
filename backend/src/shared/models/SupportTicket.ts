import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportTicket extends Document {
  _id: mongoose.Types.ObjectId;
  ticketNumber: string;
  userId: mongoose.Types.ObjectId;
  role: 'FARMER' | 'PROCESSOR' | 'DISTRIBUTOR' | 'RETAILER' | 'CUSTOMER' | 'ADMIN';
  category: string;
  customCategory?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
  subject: string;
  description: string;
  referenceType?: 'ORDER' | 'SHIPMENT' | 'BATCH' | 'PAYMENT' | 'WALLET_TRANSACTION' | 'INVOICE' | 'HARVEST' | 'OTHER';
  referenceId?: string;
  assignedTo?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema: Schema = new Schema<ISupportTicket>(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: {
      type: String,
      enum: ['FARMER', 'PROCESSOR', 'DISTRIBUTOR', 'RETAILER', 'CUSTOMER', 'ADMIN'],
      required: true,
      index: true,
    },
    category: { type: String, required: true, trim: true, index: true },
    customCategory: { type: String, trim: true },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    referenceType: {
      type: String,
      enum: ['ORDER', 'SHIPMENT', 'BATCH', 'PAYMENT', 'WALLET_TRANSACTION', 'INVOICE', 'HARVEST', 'OTHER'],
    },
    referenceId: { type: String, trim: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

export const SupportTicket =
  mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
export default SupportTicket;
