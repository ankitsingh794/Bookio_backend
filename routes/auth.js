const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  logger.info('Auth register route hit');
  try {
    await register(req, res);
  } catch (error) {
    logger.error(`Register error: ${error.message}`);
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  logger.info('Auth login route hit');
  try {
    await login(req, res);
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  logger.info('Auth forgot-password route hit');
  try {
    await forgotPassword(req, res);
  } catch (error) {
    logger.error(`Forgot-password error: ${error.message}`);
    next(error);
  }
});

// PUT /api/auth/reset-password/:token
router.put('/reset-password/:token', async (req, res, next) => {
  logger.info(`Auth reset-password route hit for token: ${req.params.token}`);
  try {
    await resetPassword(req, res);
  } catch (error) {
    logger.error(`Reset-password error: ${error.message}`);
    next(error);
  }
});

module.exports = router;
