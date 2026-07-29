import mongoose, { Schema, Document } from 'mongoose';
import { InvoiceType } from '../enums/InvoiceType.js';
import { InvoicePaymentStatus } from '../enums/InvoicePaymentStatus.js';

export interface IInvoiceItem {
  cropName: string;
  variety?: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
}

export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId;
  invoiceId: string;
  orderId: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  batchReference: string;
  buyerName: string;
  sellerName: string;
  items: IInvoiceItem[];
  totalAmount: number;
  paymentStatus: 'PAID';
  invoiceType: 'SALES' | 'PURCHASE';
  invoicePdfPath?: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    cropName: { type: String, required: true, trim: true },
    variety: { type: String, trim: true },
    quantityKg: { type: Number, required: true, min: 0 },
    pricePerKg: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const InvoiceSchema: Schema = new Schema<IInvoice>(
  {
    invoiceId: { type: String, required: true, unique: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    batchReference: { type: String, required: true, index: true },
    buyerName: { type: String, required: true, trim: true },
    sellerName: { type: String, required: true, trim: true },
    items: { type: [InvoiceItemSchema], required: true, default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: Object.values(InvoicePaymentStatus),
      default: InvoicePaymentStatus.PAID,
    },
    invoiceType: {
      type: String,
      enum: Object.values(InvoiceType),
      default: InvoiceType.SALES,
    },
    invoicePdfPath: { type: String },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Enforce database-level uniqueness to prevent race conditions during concurrent escrow releases
InvoiceSchema.index({ orderId: 1, invoiceType: 1 }, { unique: true });

export const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
export default Invoice;
