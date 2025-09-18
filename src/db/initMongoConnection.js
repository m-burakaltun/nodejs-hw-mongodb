import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const initMongoConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Mongo connection successfully established!');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};