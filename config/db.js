const mongoose = require('mongoose');
const logger = require('./logger');  // adjust path if needed

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('✅ MongoDB Connected');
  } catch (err) {
    logger.error(`❌ MongoDB connection error: ${err.message || err}`);
    process.exit(1);
  }
};

module.exports = connectDB;
