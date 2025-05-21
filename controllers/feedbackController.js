const Feedback = require("../models/Feedback");
const Event = require("../models/Events");
const logger = require("../config/logger"); 

// 1. App Support Feedback (any user)
const submitAppSupportFeedback = async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const feedback = new Feedback({
      userId: req.user?._id,
      name,
      email,
      message,
      type: "app_support",
    });
    await feedback.save();
    logger.info(`App support feedback submitted by user ${req.user?._id || "guest"}`);
    res.status(201).json({ message: "App support feedback submitted." });
  } catch (err) {
    logger.error("Error submitting app support feedback", err);
    res.status(500).json({ message: "Server error." });
  }
};

// 2. Event Feedback (any user)
const submitEventFeedback = async (req, res) => {
  const { name, email, message, eventId } = req.body;
  if (!name || !email || !message || !eventId) {
    return res.status(400).json({ message: "All fields including eventId are required." });
  }

  try {
    const feedback = new Feedback({
      userId: req.user?._id,
      name,
      email,
      message,
      type: "event_message",
      eventId,
    });
    await feedback.save();
    logger.info(`Event feedback submitted for event ${eventId} by user ${req.user?._id || "guest"}`);
    res.status(201).json({ message: "Event feedback submitted." });
  } catch (err) {
    logger.error("Error submitting event feedback", err);
    res.status(500).json({ message: "Server error." });
  }
};

// 3. Admin - View all App Support Feedback
const getAllAppSupportFeedbacks = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";

  const query = {
    type: "app_support",
    $or: [
      { name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
      { message: new RegExp(search, "i") },
    ],
  };

  try {
    const total = await Feedback.countDocuments(query);
    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    logger.info(`Admin fetched app support feedbacks page ${page}`);
    res.json({
      feedbacks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (err) {
    logger.error("Error fetching app support feedbacks", err);
    res.status(500).json({ message: "Error fetching support feedbacks." });
  }
};

// 4. Organizer - View feedback for their events
const getEventFeedbacksForOrganizer = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id }).select("_id");
    const eventIds = events.map((event) => event._id);

    const feedbacks = await Feedback.find({
      type: "event_message",
      eventId: { $in: eventIds },
    })
      .populate("eventId", "title")
      .sort({ createdAt: -1 });

    logger.info(`Organizer ${req.user._id} fetched feedback for their events`);
    res.json(feedbacks);
  } catch (err) {
    logger.error("Error fetching event feedbacks for organizer", err);
    res.status(500).json({ message: "Error fetching event feedbacks." });
  }
};

// Reply to Feedback
const replyToFeedback = async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  if (!reply) return res.status(400).json({ message: "Reply cannot be empty" });

  try {
    const feedback = await Feedback.findById(id).populate("eventId");
    if (!feedback || feedback.type !== "event_message") {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Check ownership of the event
    if (feedback.eventId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to reply" });
    }

    feedback.reply = reply;
    feedback.repliedAt = new Date();
    feedback.repliedBy = req.user._id;
    await feedback.save();

    logger.info(`Organizer ${req.user._id} replied to feedback ${id}`);
    res.json({ message: "Reply added successfully" });
  } catch (err) {
    logger.error("Server error while replying to feedback", err);
    res.status(500).json({ message: "Server error while replying" });
  }
};

// Delete Feedback (Organizer's)
const deleteEventFeedback = async (req, res) => {
  const { id } = req.params;

  try {
    const feedback = await Feedback.findById(id).populate("eventId");

    if (!feedback || feedback.type !== "event_message") {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (feedback.eventId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this feedback" });
    }

    await feedback.deleteOne();

    logger.info(`Organizer ${req.user._id} deleted feedback ${id}`);
    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    logger.error("Server error while deleting feedback", err);
    res.status(500).json({ message: "Server error while deleting feedback" });
  }
};

module.exports = {
  submitAppSupportFeedback,
  submitEventFeedback,
  getAllAppSupportFeedbacks,
  getEventFeedbacksForOrganizer,
  replyToFeedback,
  deleteEventFeedback,
};
