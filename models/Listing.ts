import mongoose, { Schema, model, models } from 'mongoose';

export interface IListing {
  seller: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  campus: string;
  tags: string[];
  views: number;
  rejectionReason?: string;
  isDemo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    condition: { type: String, required: true },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'sold'],
      default: 'pending'
    },
    campus: { type: String, required: true },
    tags: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    rejectionReason: { type: String, default: '' },
    isDemo: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default models.Listing || model<IListing>('Listing', ListingSchema);
