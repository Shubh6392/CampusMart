import mongoose, { Schema, model, models } from 'mongoose';

export interface IReport {
  reportedBy: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  resolution?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open' },
    resolution: { type: String, default: '' },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default models.Report || model<IReport>('Report', ReportSchema);
