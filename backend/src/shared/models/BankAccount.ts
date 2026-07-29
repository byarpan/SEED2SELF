import mongoose, { Schema, Document } from 'mongoose';

export interface IBankAccount extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branchLocation: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BankAccountSchema: Schema = new Schema<IBankAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    bankName: { type: String, required: true, trim: true },
    accountHolderName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    ifscCode: { type: String, required: true, trim: true, uppercase: true },
    branchLocation: { type: String, required: true, trim: true },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const BankAccount = mongoose.models.BankAccount || mongoose.model<IBankAccount>('BankAccount', BankAccountSchema);
export default BankAccount;
