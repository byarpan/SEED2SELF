import mongoose, { Schema, Document } from 'mongoose';
import { TraceabilityEventType } from '../enums/TraceabilityEventType.js';

export interface ITraceabilityEvent extends Document {
  _id: mongoose.Types.ObjectId;
  batchId: string;
  eventType: TraceabilityEventType;
  performedBy: mongoose.Types.ObjectId;
  performedByRole: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TraceabilityEventSchema: Schema = new Schema<ITraceabilityEvent>(
  {
    batchId: { type: String, required: true, index: true, trim: true },
    eventType: {
      type: String,
      enum: Object.values(TraceabilityEventType),
      required: true,
      index: true,
    },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    performedByRole: { type: String, required: true, trim: true },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, required: true },
  },
  {
    timestamps: true,
  }
);

export const TraceabilityEvent =
  mongoose.models.TraceabilityEvent || mongoose.model<ITraceabilityEvent>('TraceabilityEvent', TraceabilityEventSchema);
export default TraceabilityEvent;
