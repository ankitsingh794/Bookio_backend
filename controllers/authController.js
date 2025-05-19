const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/emailSender');
const logger = require('../config/logger'); 

// Generate JWT token with user ID and isAdmin flag
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      logger.warn('Registration attempt with existing email: %s', normalizedEmail);
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      status: 'active',
    });

    logger.info('New user registered: %s', user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        status: user.status,
      },
      token: generateToken(user),
    });
  } catch (error) {
    logger.error('Error in register: %o', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user and compare hashed password
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      logger.warn('Login attempt with missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    email = email.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Failed login attempt: user not found for email %s', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      logger.warn('Suspended user %s attempted login', user._id);
      return res.status(403).json({ message: 'Your account is suspended. Please contact support.' });
    }

    if (user.status === 'banned') {
      logger.warn('Banned user %s attempted login', user._id);
      return res.status(403).json({ message: 'Your account is banned.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      logger.warn('Invalid password attempt for user %s', user._id);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    logger.info('User logged in successfully: %s', user._id);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        status: user.status,
      },
      token: generateToken(user),
    });
  } catch (error) {
    logger.error('Login error: %o', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Forgot password - send reset token via email
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  let user;

  try {
    user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      logger.warn('Forgot password request for non-existing email: %s', email);
      return res.status(404).json({ message: 'No user found with this email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const message = `You requested a password reset.\n\nClick this link to reset your password:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: message,
    });

    logger.info('Password reset email sent to user: %s', user._id);

    res.status(200).json({ message: 'Reset email sent' });
  } catch (error) {
    logger.error('Error sending password reset email: %o', error);
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    res.status(500).json({ message: 'Email could not be sent', error: error.message });
  }
};

// Reset password - update user's password
exports.resetPassword = async (req, res) => {
  const resetToken = req.params.token;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn('Invalid or expired password reset token used');
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    logger.info('Password reset successful for user: %s', user._id);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error('Failed to reset password: %o', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};
