const Event = require('../models/Events');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const logger = require('../config/logger'); 

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'bookio_events' },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Create Event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, location, date, price } = req.body;

    if (!title || !location || !date || !price) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let imageUrl = '';
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer);
      } catch (uploadErr) {
        logger.error('Error uploading event image:', uploadErr);
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    const event = new Event({
      title,
      description,
      location,
      date,
      price,
      imageUrl,
      createdBy: req.user.id,
    });

    await event.save();
    res.status(201).json({ success: true, message: 'Event created successfully', data: event });
  } catch (error) {
    logger.error('Error creating event:', error);
    res.status(500).json({ success: false, message: 'Error creating event' });
  }
};

// Get All Events with pagination and optional filters
exports.getEvents = async (req, res) => {
  const { page = 1, limit = 10, startDate, endDate, minPrice, maxPrice } = req.query;
  const query = {};

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  try {
    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Event.countDocuments(query);

    res.status(200).json({ success: true, data: events, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    logger.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: 'Error fetching events' });
  }
};

// Get Single Event
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    logger.error('Error fetching event:', error);
    res.status(500).json({ success: false, message: 'Error fetching event' });
  }
};

// Update Event
exports.updateEvent = async (req, res) => {
  try {
    const { title, description, location, date, price } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.createdBy.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    if (req.file) {
      try {
        event.imageUrl = await uploadToCloudinary(req.file.buffer);
      } catch (uploadErr) {
        logger.error('Error uploading updated event image:', uploadErr);
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    Object.assign(event, {
      title: title || event.title,
      description: description || event.description,
      location: location || event.location,
      date: date || event.date,
      price: price || event.price,
    });

    await event.save();
    res.status(200).json({ success: true, message: 'Event updated successfully', data: event });
  } catch (error) {
    logger.error('Error updating event:', error);
    res.status(500).json({ success: false, message: 'Error updating event' });
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    await event.deleteOne();
    res.status(200).json({ success: true, message: 'Event deleted successfully', data: event });
  } catch (error) {
    logger.error('Error deleting event:', error);
    res.status(500).json({ success: false, message: 'Error deleting event' });
  }
};

// To fetch nearby events
exports.getNearbyEvents = async (req, res) => {
  const { lat, lng, radius = 10 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
  }

  try {
    const events = await Event.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radius * 1000, 
        }
      }
    });

    res.status(200).json({ success: true, data: events });
  } catch (error) {
    logger.error('Failed to fetch nearby events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch nearby events' });
  }
};
