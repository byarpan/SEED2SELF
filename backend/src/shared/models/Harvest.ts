import mongoose, { Schema, Document } from 'mongoose';
import { ListingStatus } from '../enums/ListingStatus.js';
import { HarvestStatus } from '../enums/HarvestStatus.js';

export interface IHarvest extends Document {
  _id: mongoose.Types.ObjectId;
  batchId: string;
  farmerId: mongoose.Types.ObjectId;
  farmId?: mongoose.Types.ObjectId;
  cropCategory: string;
  cropName: string;
  cropVariety?: string;
  harvestVolume: number;
  availableVolume: number;
  sellingPrice: number;
  harvestDate: Date;
  cropImage?: string;
  listingStatus: ListingStatus;
  harvestStatus: HarvestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const HarvestSchema: Schema = new Schema<IHarvest>(
  {
    batchId: { type: String, required: true, unique: true, index: true, trim: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmId: { type: Schema.Types.ObjectId, ref: 'Farm', index: true },
    cropCategory: { type: String, required: true, trim: true },
    cropName: { type: String, required: true, trim: true },
    cropVariety: { type: String, trim: true, default: 'None' },
    harvestVolume: { type: Number, required: true, min: 0 },
    availableVolume: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    harvestDate: { type: Date, required: true },
    cropImage: { type: String, trim: true },
    listingStatus: {
      type: String,
      enum: Object.values(ListingStatus),
      default: ListingStatus.UNLISTED,
      index: true,
    },
    harvestStatus: {
      type: String,
      enum: Object.values(HarvestStatus),
      default: HarvestStatus.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Harvest = mongoose.models.Harvest || mongoose.model<IHarvest>('Harvest', HarvestSchema);
export default Harvest;
