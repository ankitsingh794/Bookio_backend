const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    // Human-readable address (optional, for UI display)
    address: { type: String },

    // GeoJSON location for geospatial queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // Format: [longitude, latitude]
        required: true,
      },
    },

    date: { type: Date, required: true },
    imageUrl: { type: String },
    price: { type: Number, required: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Index for geospatial queries on location field
eventSchema.index({ location: '2dsphere' });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
