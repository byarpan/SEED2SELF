import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  addressLine: string;
  village: string;
  district: string;
  state: string;
  pinCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema: Schema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    addressLine: { type: String, required: true, trim: true },
    village: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, trim: true },
    country: { type: String, default: 'India', trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  {
    timestamps: true,
  }
);

export const Address = mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema);
export default Address;
