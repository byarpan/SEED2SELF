import mongoose, { Schema, Document } from 'mongoose';

export interface IProcessorFactory extends Document {
  _id: mongoose.Types.ObjectId;
  processorId: mongoose.Types.ObjectId;
  factoryName: string;
  contactPerson: string;
  contactNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  pinCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProcessorFactorySchema: Schema = new Schema<IProcessorFactory>(
  {
    processorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    factoryName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    streetAddress: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, trim: true },
    country: { type: String, trim: true, default: 'India' },
    latitude: { type: Number },
    longitude: { type: Number },
    googleMapsUrl: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ProcessorFactory =
  mongoose.models.ProcessorFactory ||
  mongoose.model<IProcessorFactory>('ProcessorFactory', ProcessorFactorySchema);

export default ProcessorFactory;
