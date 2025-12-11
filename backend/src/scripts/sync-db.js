import mongoose from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const syncDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB connection established');
    } else {
      await new Promise((res, rej) => {
        mongoose.connection.once('open', res);
        mongoose.connection.once('error', rej);
      });
      console.log('MongoDB connected');
    }

    // Ensure indexes for all models
    const models = mongoose.models;
    for (const name of Object.keys(models)) {
      await models[name].createIndexes();
      console.log(`Ensured indexes for model: ${name}`);
    }

    console.log('Database sync (indexes) completed');
    process.exit(0);
  } catch (error) {
    console.error('Database sync failed:', error);
    process.exit(1);
  }
};

syncDatabase();
