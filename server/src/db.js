const mongoose = require('mongoose');

const DB_URL = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;