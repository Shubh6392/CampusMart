import mongoose, { Schema, model, models } from 'mongoose';

export interface IBookmark {
  user: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true }
  },
  { timestamps: true }
);

BookmarkSchema.index({ user: 1, listing: 1 }, { unique: true });

export default models.Bookmark || model<IBookmark>('Bookmark', BookmarkSchema);
