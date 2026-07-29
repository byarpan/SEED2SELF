import mongoose, { Schema, Document } from 'mongoose';

export interface IFarm extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  farmName: string;
  farmLocation: string;
  latitude?: number;
  longitude?: number;
  totalLandArea: number;
  landAreaUnit: string;
  farmingPractice: string;
  mainCultivatedCrops: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FarmSchema: Schema = new Schema<IFarm>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    farmName: { type: String, required: true, trim: true },
    farmLocation: { type: String, required: true, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    totalLandArea: { type: Number, required: true, min: 0 },
    landAreaUnit: { type: String, required: true, default: 'Acres', trim: true },
    farmingPractice: { type: String, required: true, trim: true },
    mainCultivatedCrops: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

export const Farm = mongoose.models.Farm || mongoose.model<IFarm>('Farm', FarmSchema);
export default Farm;
