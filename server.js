const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const logger = require('./config/logger'); 
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/uploadRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Basic root route
app.get('/', (req, res) => {
  res.send('Bookio Backend Running ✅');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/feedback', feedbackRoutes);

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Global error handler: ${err.stack || err}`);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  try {
    logger.warn('🔴 Shutting down server...');
    server.close(() => {
      logger.info('HTTP server closed');
    });

    await mongoose.connection.close(false);
    logger.info('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown:', err);
    process.exit(1);
  }
};


process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
