const axios = require("axios");
const logger = require("../utils/logger");

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:3004";

/**
 * Sends a booking confirmation notification.
 * Failures are logged but do NOT bubble up — notifications are best-effort.
 */
const sendBookingConfirmation = async ({ userId, userEmail, eventTitle, bookingId }) => {
  try {
    await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notify`,
      {
        userId,
        userEmail,
        eventTitle,
        bookingId,
        type: "BOOKING_CONFIRMED",
      },
      { timeout: 5000 }
    );
    logger.info("Booking confirmation notification sent", { bookingId, userId });
  } catch (err) {
    logger.warn("Failed to send booking confirmation notification", {
      bookingId,
      userId,
      error: err.message,
    });
  }
};

/**
 * Sends a booking cancellation notification.
 * Failures are logged but do NOT bubble up — notifications are best-effort.
 */
const sendBookingCancellation = async ({ userId, userEmail, eventTitle, bookingId }) => {
  try {
    await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notify`,
      {
        userId,
        userEmail,
        eventTitle,
        bookingId,
        type: "BOOKING_CANCELLED",
      },
      { timeout: 5000 }
    );
    logger.info("Booking cancellation notification sent", { bookingId, userId });
  } catch (err) {
    logger.warn("Failed to send booking cancellation notification", {
      bookingId,
      userId,
      error: err.message,
    });
  }
};

module.exports = { sendBookingConfirmation, sendBookingCancellation };
