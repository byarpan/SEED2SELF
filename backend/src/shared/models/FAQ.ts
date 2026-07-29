import mongoose, { Schema, Document } from 'mongoose';

export interface IFAQ extends Document {
  _id: mongoose.Types.ObjectId;
  role: 'FARMER' | 'PROCESSOR' | 'DISTRIBUTOR' | 'RETAILER' | 'CUSTOMER' | 'ALL';
  category: string;
  question: string;
  answer: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema: Schema = new Schema<IFAQ>(
  {
    role: {
      type: String,
      enum: ['FARMER', 'PROCESSOR', 'DISTRIBUTOR', 'RETAILER', 'CUSTOMER', 'ALL'],
      required: true,
      index: true,
    },
    category: { type: String, required: true, trim: true, index: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    displayOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const FAQ = mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', FAQSchema);
export default FAQ;
