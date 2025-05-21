const User = require('../models/User');
const logger = require('../config/logger'); 

exports.updateUserProfile = async (req, res) => {
  const userId = req.params.id;

  if (req.user.id !== userId && !req.user.isAdmin) {
    logger.warn(`Unauthorized profile update attempt by user ${req.user.id} on user ${userId}`);
    return res.status(403).json({ message: 'Access denied: You can only edit your own profile' });
  }

  try {
    const updates = { ...req.body };

    // Prevent updating sensitive/immutable fields
    delete updates.password;
    delete updates.isAdmin;
    delete updates.createdAt;

    // Only admins can update status
    if ('status' in updates) {
      if (!req.user.isAdmin) {
        logger.warn(`User ${req.user.id} tried to update status without admin rights`);
        return res.status(403).json({ message: 'Only admins can change account status' });
      }

      const allowedStatuses = ['active', 'suspended', 'banned'];
      if (!allowedStatuses.includes(updates.status)) {
        logger.warn(`User ${req.user.id} provided invalid account status: ${updates.status}`);
        return res.status(400).json({ message: 'Invalid account status' });
      }
    }

    if (Object.keys(updates).length === 0) {
      logger.info(`User ${userId} sent empty or invalid updates`);
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updatedUser) {
      logger.warn(`User not found for update: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info(`User profile updated successfully for user ${userId}`);
    res.json({
      message: 'User profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error(`Error updating user profile for ${userId}: ${error.message}`);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};


exports.updateAccountStatus = async (req, res) => {
  if (!req.user.isAdmin) {
    logger.warn(`Non-admin user ${req.user.id} attempted to update account status`);
    return res.status(403).json({ message: 'Only admins can update account status' });
  }

  const userId = req.params.id;
  const { status } = req.body;
  const allowedStatuses = ['active', 'suspended', 'banned'];

  if (!allowedStatuses.includes(status)) {
    logger.warn(`Invalid account status update attempt: ${status} for user ${userId}`);
    return res.status(400).json({ message: 'Invalid account status' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      logger.warn(`User not found for status update: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info(`Account status updated to ${status} for user ${userId}`);
    res.json({
      message: 'Account status updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error(`Error updating account status for ${userId}: ${error.message}`);
    res.status(500).json({ message: 'Failed to update account status', error: error.message });
  }
};
