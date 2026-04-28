import mongoose, { Schema, model, models } from 'mongoose';

export interface IAnalytics {
  listing: mongoose.Types.ObjectId;
  views: number;
  uniqueVisitors: number;
  dailyStats: { date: string; count: number }[];
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true, unique: true },
    views: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    dailyStats: { type: [{ date: String, count: Number }], default: [] }
  },
  { timestamps: true }
);

export default models.Analytics || model<IAnalytics>('Analytics', AnalyticsSchema);
