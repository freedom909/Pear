import mongoose from 'mongoose';
import AppError from '../utils/appError';

const DB = process.env.DATABASE?.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD || ''
) as string;

export const connectDB = async () => {
  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    } as mongoose.ConnectOptions);

    console.log('DB connection successful!');
  } catch (err) {
    throw new AppError('DB connection failed!', 500);
  }
};