import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalWithMongoose = globalThis as typeof globalThis & { _mongooseCache?: MongooseCache };

if (!globalWithMongoose._mongooseCache) {
  globalWithMongoose._mongooseCache = { conn: null, promise: null };
}

const cache = globalWithMongoose._mongooseCache;

export async function connectToDatabase() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined');

  if (cache.conn) return cache.conn.connection;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  cache.conn = await cache.promise;
  return cache.conn.connection;
}
