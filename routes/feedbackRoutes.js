const express = require("express");
const logger = require("../config/logger");
const {
  submitAppSupportFeedback,
  submitEventFeedback,
  getAllAppSupportFeedbacks,
  getEventFeedbacksForOrganizer,
  replyToFeedback,
  deleteEventFeedback,
} = require("../controllers/feedbackController.js");

const { protect, adminOnly } = require("../middlewares/authMiddleware.js");

const router = express.Router();

// App Support Feedback routes
router.post("/support", async (req, res, next) => {
  logger.info("POST /feedback/support - submitAppSupportFeedback route hit");
  try {
    await submitAppSupportFeedback(req, res);
  } catch (error) {
    logger.error(`submitAppSupportFeedback error: ${error.message}`);
    next(error);
  }
});

router.get("/support", protect, adminOnly, async (req, res, next) => {
  logger.info("GET /feedback/support - getAllAppSupportFeedbacks route hit");
  try {
    await getAllAppSupportFeedbacks(req, res);
  } catch (error) {
    logger.error(`getAllAppSupportFeedbacks error: ${error.message}`);
    next(error);
  }
});

// Event Feedback routes
router.post("/event", async (req, res, next) => {
  logger.info("POST /feedback/event - submitEventFeedback route hit");
  try {
    await submitEventFeedback(req, res);
  } catch (error) {
    logger.error(`submitEventFeedback error: ${error.message}`);
    next(error);
  }
});

router.get("/event", protect, async (req, res, next) => {
  logger.info("GET /feedback/event - getEventFeedbacksForOrganizer route hit");
  try {
    await getEventFeedbacksForOrganizer(req, res);
  } catch (error) {
    logger.error(`getEventFeedbacksForOrganizer error: ${error.message}`);
    next(error);
  }
});

// Organizer replies to and deletes event feedback
router.put("/event/:id/reply", protect, async (req, res, next) => {
  logger.info(`PUT /feedback/event/${req.params.id}/reply - replyToFeedback route hit`);
  try {
    await replyToFeedback(req, res);
  } catch (error) {
    logger.error(`replyToFeedback error: ${error.message}`);
    next(error);
  }
});

router.delete("/event/:id", protect, async (req, res, next) => {
  logger.info(`DELETE /feedback/event/${req.params.id} - deleteEventFeedback route hit`);
  try {
    await deleteEventFeedback(req, res);
  } catch (error) {
    logger.error(`deleteEventFeedback error: ${error.message}`);
    next(error);
  }
});

module.exports = router;
