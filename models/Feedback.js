const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    reply: { type: String },

    // Feedback type: app support or event-specific message
    type: {
      type: String,
      enum: ['app_support', 'event_message'],
      default: 'app_support',
    },

    // Required only if type is event_message
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: function () {
        return this.type === 'event_message';
      },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } } 
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
