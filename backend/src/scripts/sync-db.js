import dotenv from 'dotenv';
import sequelize from '../config/database.js';

dotenv.config();

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    await sequelize.sync({ alter: true });
    console.log('Database tables synced successfully');

    process.exit(0);
  } catch (error) {
    console.error('Database sync failed:', error);
    process.exit(1);
  }
};

syncDatabase();
