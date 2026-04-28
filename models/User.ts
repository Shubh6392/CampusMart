import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  image?: string;
  passwordHash?: string;
  college: string;
  role: 'buyer' | 'seller' | 'admin';
  emailVerified?: Date;
  status: 'active' | 'banned';
  domain: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    passwordHash: { type: String },
    college: { type: String, required: true },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    emailVerified: { type: Date },
    status: { type: String, enum: ['active', 'banned'], default: 'active' },
    domain: { type: String, required: true }
  },
  { timestamps: true, bufferCommands: false }
);

export default models.User || model<IUser>('User', UserSchema);
