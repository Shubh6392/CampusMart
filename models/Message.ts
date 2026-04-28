import mongoose, { Schema, model, models } from 'mongoose';

export interface IMessage {
  conversationId: string;
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true, index: true },
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default models.Message || model<IMessage>('Message', MessageSchema);
