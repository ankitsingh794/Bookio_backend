const logger = require('../config/logger');

const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  } else {
    logger.warn(`Unauthorized admin access attempt by user ${req.user ? req.user.id : 'unknown'}`);
    return res.status(403).json({ message: 'Admin access required' });
  }
};

module.exports = adminOnly;
