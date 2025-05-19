const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const {
  updateUserProfile,
  updateAccountStatus,
} = require('../controllers/userController');

// User can update own profile or admins can update any profile
router.patch('/:id', protect, updateUserProfile);

// Admin-only: update account status (suspend/ban/unban)
router.patch('/:id/status', protect, adminOnly, updateAccountStatus);

module.exports = router;
