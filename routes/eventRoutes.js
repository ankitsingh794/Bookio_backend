const express = require('express');
const logger = require('../config/logger');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer');

// Nearby Events (must come before '/:id' to prevent route clash)
router.get('/nearby', async (req, res, next) => {
  logger.info('GET /events/nearby - getNearbyEvents route hit');
  try {
    await eventController.getNearbyEvents(req, res);
  } catch (error) {
    logger.error(`getNearbyEvents error: ${error.message}`);
    next(error);
  }
});

// Public Routes
router.get('/', async (req, res, next) => {
  logger.info('GET /events - getEvents route hit');
  try {
    await eventController.getEvents(req, res);
  } catch (error) {
    logger.error(`getEvents error: ${error.message}`);
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  logger.info(`GET /events/${req.params.id} - getEvent route hit`);
  try {
    await eventController.getEvent(req, res);
  } catch (error) {
    logger.error(`getEvent error: ${error.message}`);
    next(error);
  }
});

// Protected Routes
router.post('/', protect, upload.single('image'), async (req, res, next) => {
  logger.info('POST /events - createEvent route hit');
  try {
    await eventController.createEvent(req, res);
  } catch (error) {
    logger.error(`createEvent error: ${error.message}`);
    next(error);
  }
});

router.put('/:id', protect, upload.single('image'), async (req, res, next) => {
  logger.info(`PUT /events/${req.params.id} - updateEvent route hit`);
  try {
    await eventController.updateEvent(req, res);
  } catch (error) {
    logger.error(`updateEvent error: ${error.message}`);
    next(error);
  }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  logger.info(`DELETE /events/${req.params.id} - deleteEvent route hit`);
  try {
    await eventController.deleteEvent(req, res);
  } catch (error) {
    logger.error(`deleteEvent error: ${error.message}`);
    next(error);
  }
});

module.exports = router;
