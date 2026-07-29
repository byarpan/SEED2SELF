import mongoose, { Schema, Document } from 'mongoose';

export interface IProcessorAddress extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  addressType: string;
  addressLine?: string;
  village?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProcessorAddressSchema: Schema = new Schema<IProcessorAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    addressType: { type: String, default: 'PERMANENT' },
    addressLine: { type: String, trim: true, default: '' },
    village: { type: String, trim: true, default: '' },
    district: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pinCode: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'India' },
  },
  {
    timestamps: true,
  }
);

export const ProcessorAddress =
  mongoose.models.ProcessorAddress ||
  mongoose.model<IProcessorAddress>('ProcessorAddress', ProcessorAddressSchema);

export default ProcessorAddress;
