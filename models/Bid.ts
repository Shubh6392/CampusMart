import mongoose, { Schema, model, models } from 'mongoose';

export interface IBid {
  listing: mongoose.Types.ObjectId;
  bidder: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const BidSchema = new Schema<IBid>(
  {
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    bidder: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
  },
  { timestamps: true }
);

export default models.Bid || model<IBid>('Bid', BidSchema);
