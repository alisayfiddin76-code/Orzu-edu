const mongoose = require('mongoose');

/**
 * Connect to MongoDB Database using Mongoose
 */
const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI;
    
    if (!connStr) {
      console.error('CRITICAL ERROR: MONGO_URI is not defined in the environment variables.');
      process.exit(1);
    }

    const conn = await mongoose.connect(connStr);

    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
