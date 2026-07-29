import mongoose, { Schema, Document } from 'mongoose';

export interface IEscrow extends Document {
  _id: mongoose.Types.ObjectId;
  escrowId: string;
  userId: mongoose.Types.ObjectId;
  payerId?: mongoose.Types.ObjectId;
  payeeId?: mongoose.Types.ObjectId;
  role?: 'FARMER' | 'PROCESSOR' | 'DISTRIBUTOR' | 'RETAILER' | 'ADMIN';
  cropName: string;
  cropImage?: string;
  batchNumber: string;
  quantity: string;
  supplier: string; // Counterparty / Partner Name
  escrowAmount: string;
  rawAmount: number;
  orderStatus: string;
  orderId: string;
  escrowType: 'DISTRIBUTOR_PURCHASE' | 'FARMER_RAW_MATERIAL' | 'RETAILER_PURCHASE' | 'GENERAL';
  status: 'LOCKED' | 'RELEASED' | 'REFUNDED';
  releasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EscrowSchema: Schema = new Schema<IEscrow>(
  {
    escrowId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    payerId: { type: Schema.Types.ObjectId, ref: 'User' },
    payeeId: { type: Schema.Types.ObjectId, ref: 'User' },
    role: {
      type: String,
      enum: ['FARMER', 'PROCESSOR', 'DISTRIBUTOR', 'RETAILER', 'ADMIN'],
      default: 'PROCESSOR',
    },
    cropName: { type: String, required: true, trim: true },
    cropImage: { type: String, trim: true },
    batchNumber: { type: String, required: true, trim: true },
    quantity: { type: String, required: true, trim: true },
    supplier: { type: String, required: true, trim: true },
    escrowAmount: { type: String, required: true },
    rawAmount: { type: Number, required: true, min: 0 },
    orderStatus: { type: String, required: true },
    orderId: { type: String, required: true, index: true },
    escrowType: {
      type: String,
      enum: ['DISTRIBUTOR_PURCHASE', 'FARMER_RAW_MATERIAL', 'RETAILER_PURCHASE', 'GENERAL'],
      default: 'DISTRIBUTOR_PURCHASE',
    },
    status: {
      type: String,
      enum: ['LOCKED', 'RELEASED', 'REFUNDED'],
      default: 'LOCKED',
    },
    releasedAt: { type: Date },
  },
  { timestamps: true }
);

export const Escrow = mongoose.models.Escrow || mongoose.model<IEscrow>('Escrow', EscrowSchema);
export default Escrow;
