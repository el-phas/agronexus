import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.DATABASE_URL;

const connect = async () => {
  try {
    if (!MONGODB_URI) {
      console.error('\n[MongoDB] No MongoDB URI provided. Set MONGODB_URI (or MONGODB_URL / DATABASE_URL) in environment.\nExample: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname\n');
      // Exit with non-zero so hosting platforms surface the misconfiguration quickly
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || 'agronexus',
      autoIndex: process.env.NODE_ENV === 'development',
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
};

connect();

export default mongoose;
