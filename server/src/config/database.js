import mongoose from 'mongoose';
import { env, database } from '/app/config/index.js';
import logger from '../utils/logger.js';

const connectDB = async() => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, database.options);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
