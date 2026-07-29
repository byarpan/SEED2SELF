import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletTransaction extends Document {
  _id: mongoose.Types.ObjectId;
  transactionId: string;
  userId: mongoose.Types.ObjectId;
  processorId?: string;
  title: string;
  productName: string;
  counterparty: string;
  counterpartyRole: 'Farmer' | 'Distributor' | 'Processor' | 'Admin';
  counterpartyUpi?: string;
  orderId?: string;
  amount: string;
  rawAmount: number;
  type: 'ESCROW' | 'DISTRIBUTOR' | 'FARMER_PAYMENT' | 'PAYOUT' | 'WITHDRAWAL' | 'ESCROW_RELEASED' | 'ESCROW_LOCKED' | 'ORDER_PAYMENT' | 'REFUND';
  status: string;
  bankName?: string;
  utr?: string;
  timeframe?: 'LIFETIME' | 'YEARLY' | 'MONTHLY' | 'WEEKLY';
  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema: Schema = new Schema<IWalletTransaction>(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    processorId: { type: String, index: true },
    title: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    counterparty: { type: String, required: true, trim: true },
    counterpartyRole: {
      type: String,
      enum: ['Farmer', 'Distributor', 'Processor', 'Admin'],
      default: 'Distributor',
    },
    counterpartyUpi: { type: String, trim: true },
    orderId: { type: String, trim: true },
    amount: { type: String, required: true },
    rawAmount: { type: Number, required: true },
    type: {
      type: String,
      enum: ['ESCROW', 'DISTRIBUTOR', 'FARMER_PAYMENT', 'PAYOUT', 'WITHDRAWAL', 'ESCROW_RELEASED', 'ESCROW_LOCKED', 'ORDER_PAYMENT', 'REFUND'],
      default: 'FARMER_PAYMENT',
    },
    status: { type: String, default: 'Transaction Successful' },
    bankName: { type: String, trim: true },
    utr: { type: String, trim: true },
    timeframe: {
      type: String,
      enum: ['LIFETIME', 'YEARLY', 'MONTHLY', 'WEEKLY'],
      default: 'MONTHLY',
    },
  },
  { timestamps: true }
);

export const WalletTransaction =
  mongoose.models.WalletTransaction ||
  mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);

export default WalletTransaction;
