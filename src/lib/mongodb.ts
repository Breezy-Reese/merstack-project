import mongoose from 'mongoose';

const mongoUri = import.meta.env.VITE_MONGODB_URI;

if (!mongoUri) {
  throw new Error('Missing MongoDB connection string in environment variables');
}

export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  return mongoose.connect(mongoUri);
}
