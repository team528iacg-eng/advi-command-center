import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// If no URI configured, DB is disabled — app falls back to localStorage
export const isDBEnabled = !!MONGODB_URI;

// Cache the connection on the global object to survive Next.js hot-reload in dev
const globalWithMongoose = global as typeof globalThis & {
  _mongooseCache?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

let cached = globalWithMongoose._mongooseCache ?? { conn: null, promise: null };
globalWithMongoose._mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) return null;
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}
