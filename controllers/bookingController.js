const Booking = require("../models/Booking");
const Event = require("../models/Events");
const logger = require("../config/logger"); 
const sendEmail = require("../utils/emailSender"); 

// Helper: Validate ticketsBooked
const validateTickets = (tickets, maxAvailable) => {
  if (!Number.isInteger(tickets) || tickets <= 0) return false;
  if (tickets > maxAvailable) return false;
  return true;
};

// Create a booking
const createBooking = async (req, res) => {
  const { eventId, ticketsBooked } = req.body;
  const userId = req.user._id;

  if (!eventId || ticketsBooked === undefined) {
    return res.status(400).json({ success: false, message: "Event ID and ticketsBooked are required" });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (!validateTickets(ticketsBooked, event.ticketsAvailable)) {
      return res.status(400).json({ success: false, message: `Invalid tickets number. Max available: ${event.ticketsAvailable}` });
    }

    // Deduct tickets
    event.ticketsAvailable -= ticketsBooked;
    await event.save();

    const newBooking = new Booking({
      userId,
      eventId,
      ticketsBooked,
      status: "pending",
      paymentStatus: "unpaid",
      bookingDate: new Date(), 
    });

    await newBooking.save();

    // Send confirmation email (adjust as per your email util)
    try {
      await sendEmail({
        to: req.user.email,
        subject: "Booking Confirmation - Bookio",
        text: `Your booking for event "${event.title}" on ${event.date} has been created successfully.`,
      });
    } catch (emailErr) {
      logger.error("Failed to send booking confirmation email:", emailErr);
    }

    res.status(201).json({ success: true, message: "Booking created successfully", data: newBooking });
  } catch (err) {
    logger.error("Error creating booking:", err);
    res.status(500).json({ success: false, message: "Error creating booking" });
  }
};

// Get bookings by logged-in user (with pagination and optional status filter)
const getUserBookings = async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, status } = req.query;

  const query = { userId };
  if (status) query.status = status;

  try {
    const bookings = await Booking.find(query)
      .populate("eventId", "title date location")
      .sort({ bookingDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({ success: true, data: bookings, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    logger.error("Error fetching user bookings:", err);
    res.status(500).json({ success: false, message: "Error fetching user bookings" });
  }
};

// Get bookings for a specific event (organizer) with pagination & optional filters
const getEventBookings = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;
  const { page = 1, limit = 10, status } = req.query;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (event.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view bookings for this event" });
    }

    const query = { eventId };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate("userId", "name email")
      .sort({ bookingDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({ success: true, data: bookings, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    logger.error("Error fetching event bookings:", err);
    res.status(500).json({ success: false, message: "Error fetching event bookings" });
  }
};

// Update booking status/payment status
const updateBookingStatus = async (req, res) => {
  const { bookingId } = req.params;
  const { status, paymentStatus } = req.body;
  const userId = req.user._id;

  try {
    const booking = await Booking.findById(bookingId).populate("eventId");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (
      booking.eventId.createdBy.toString() !== userId.toString() &&
      booking.userId.toString() !== userId.toString()
    ) {
      return res.status(403).json({ success: false, message: "Not authorized to update this booking" });
    }

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    await booking.save();
    res.json({ success: true, message: "Booking updated", data: booking });
  } catch (err) {
    logger.error("Error updating booking:", err);
    res.status(500).json({ success: false, message: "Error updating booking" });
  }
};

// Delete booking (only by user who booked)
const deleteBooking = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this booking" });
    }

    await booking.deleteOne();
    res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    logger.error("Error deleting booking:", err);
    res.status(500).json({ success: false, message: "Error deleting booking" });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getEventBookings,
  updateBookingStatus,
  deleteBooking,
};
