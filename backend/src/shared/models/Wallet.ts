import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  _id: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  balance: number;
  totalRevenue: number;
  pendingEscrow: number;
  withdrawn: number;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema: Schema = new Schema<IWallet>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    balance: { type: Number, required: true, default: 0, min: 0 },
    totalRevenue: { type: Number, required: true, default: 0, min: 0 },
    pendingEscrow: { type: Number, required: true, default: 0, min: 0 },
    withdrawn: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const Wallet = mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);
export default Wallet;
