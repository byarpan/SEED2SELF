import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  paymentId: string;
  orderId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  amount: number;
  escrowStatus: 'LOCKED' | 'RELEASED' | 'REFUNDED';
  releasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema<IPayment>(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    escrowStatus: {
      type: String,
      enum: ['LOCKED', 'RELEASED', 'REFUNDED'],
      default: 'LOCKED',
    },
    releasedAt: { type: Date },
  },
  { timestamps: true }
);

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;
