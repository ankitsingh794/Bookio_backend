const express = require('express');
const logger = require('../config/logger');
const { protect } = require('../middlewares/authMiddleware');
const {
  createBooking,
  getUserBookings,
  getEventBookings,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  logger.info('POST /bookings - createBooking route hit');
  try {
    await createBooking(req, res);
  } catch (error) {
    logger.error(`createBooking error: ${error.message}`);
    next(error);
  }
});

router.get('/user', protect, async (req, res, next) => {
  logger.info('GET /bookings/user - getUserBookings route hit');
  try {
    await getUserBookings(req, res);
  } catch (error) {
    logger.error(`getUserBookings error: ${error.message}`);
    next(error);
  }
});

router.get('/event/:eventId', protect, async (req, res, next) => {
  logger.info(`GET /bookings/event/${req.params.eventId} - getEventBookings route hit`);
  try {
    await getEventBookings(req, res);
  } catch (error) {
    logger.error(`getEventBookings error: ${error.message}`);
    next(error);
  }
});

router.put('/:bookingId', protect, async (req, res, next) => {
  logger.info(`PUT /bookings/${req.params.bookingId} - updateBookingStatus route hit`);
  try {
    await updateBookingStatus(req, res);
  } catch (error) {
    logger.error(`updateBookingStatus error: ${error.message}`);
    next(error);
  }
});

router.delete('/:bookingId', protect, async (req, res, next) => {
  logger.info(`DELETE /bookings/${req.params.bookingId} - deleteBooking route hit`);
  try {
    await deleteBooking(req, res);
  } catch (error) {
    logger.error(`deleteBooking error: ${error.message}`);
    next(error);
  }
});

module.exports = router;
