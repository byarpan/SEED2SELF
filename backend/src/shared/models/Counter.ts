import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document<string> {
  _id: string;
  seq: number;
}

const CounterSchema: Schema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.models.Counter || mongoose.model<ICounter>('Counter', CounterSchema);
export default Counter;
