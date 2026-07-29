import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportReply extends Document {
  _id: mongoose.Types.ObjectId;
  ticketId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderRole: string;
  senderName: string;
  message: string;
  attachmentUrl?: string;
  isInternalNote: boolean;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportReplySchema: Schema = new Schema<ISupportReply>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'SupportTicket', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderRole: { type: String, required: true, trim: true },
    senderName: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    attachmentUrl: { type: String, trim: true },
    isInternalNote: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

export const SupportReply =
  mongoose.models.SupportReply || mongoose.model<ISupportReply>('SupportReply', SupportReplySchema);
export default SupportReply;
