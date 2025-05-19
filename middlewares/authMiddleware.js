const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

// Middleware to protect routes (check token & attach full user)
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authorization failed: No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach full user data (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      logger.warn(`Authorization failed: User not found with ID ${decoded.id}`);
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.warn('Authorization failed: Invalid token');
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to restrict access to admins only
const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    logger.warn(`Admin access denied for user ${req.user ? req.user.id : 'unknown'}`);
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

// Middleware to allow only active users
const allowOnlyActiveUsers = (req, res, next) => {
  if (!req.user) {
    logger.warn('Access denied: User not authenticated');
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const status = req.user.status;

  if (status === 'suspended') {
    logger.warn(`Access denied: User ${req.user.id} account suspended`);
    return res.status(403).json({ message: 'Account suspended. Please contact support.' });
  }

  if (status === 'banned') {
    logger.warn(`Access denied: User ${req.user.id} account banned`);
    return res.status(403).json({ message: 'Account banned. Access denied.' });
  }

  if (!status || status !== 'active') {
    logger.warn(`Access denied: User ${req.user.id} account status: ${status || 'inactive'}`);
    return res.status(403).json({ message: `Account ${status || 'inactive'}. Access denied.` });
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
  allowOnlyActiveUsers,
};
