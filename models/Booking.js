const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  ticketsBooked: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "failed"],
    default: "unpaid",
  },
  bookingDate: { type: Date, default: Date.now },
  paymentTransactionId: { type: String },
});

// Booking model stores info about event ticket bookings by users
const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
