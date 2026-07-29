import mongoose, { Schema, Document } from 'mongoose';

export interface IShipment extends Document {
  _id: mongoose.Types.ObjectId;
  shipmentId: string;
  orderId: mongoose.Types.ObjectId;
  batchId: string;
  farmerId: mongoose.Types.ObjectId;
  processorId?: mongoose.Types.ObjectId;
  cargoName?: string;
  cargoQuantity?: string;
  cargoValue?: number;
  destination?: string;
  shipmentStatus: 'PREPARING' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  inspectionResult?: 'PASSED' | 'FAILED' | 'PENDING';
  rejectionReason?: string;
  dispatchedAt?: Date;
  estimatedDelivery?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  deliveredAt?: Date;
  trackingNumber?: string;
  carrierName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema: Schema = new Schema<IShipment>(
  {
    shipmentId: { type: String, required: true, unique: true, index: true, trim: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    batchId: { type: String, required: true, index: true, trim: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    processorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    cargoName: { type: String, trim: true },
    cargoQuantity: { type: String, trim: true },
    cargoValue: { type: Number, min: 0 },
    destination: { type: String, trim: true },
    shipmentStatus: {
      type: String,
      enum: ['PREPARING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
      default: 'IN_TRANSIT',
      index: true,
    },
    inspectionResult: {
      type: String,
      enum: ['PASSED', 'FAILED', 'PENDING'],
      default: 'PENDING',
    },
    rejectionReason: { type: String, trim: true },
    dispatchedAt: { type: Date, default: Date.now },
    estimatedDelivery: { type: Date },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    deliveredAt: { type: Date },
    trackingNumber: { type: String, trim: true },
    carrierName: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Shipment = mongoose.models.Shipment || mongoose.model<IShipment>('Shipment', ShipmentSchema);
export default Shipment;
