import mongoose, { Schema, model, models } from 'mongoose';

export interface INotification {
  user: mongoose.Types.ObjectId;
  type: 'message' | 'bid' | 'listingUpdate';
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['message', 'bid', 'listingUpdate'], required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default models.Notification || model<INotification>('Notification', NotificationSchema);
