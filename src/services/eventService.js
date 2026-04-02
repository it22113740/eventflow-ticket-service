const axios = require("axios");
const logger = require("../utils/logger");

const EVENT_SERVICE_URL =
  process.env.EVENT_SERVICE_URL || "http://event-service:3003";

/**
 * Fetches event details from the Event Service.
 * Returns the event object on success, or throws with a descriptive error.
 */
const getEvent = async (eventId) => {
  try {
    const { data } = await axios.get(
      `${EVENT_SERVICE_URL}/api/events/${eventId}`,
      { timeout: 5000 }
    );
    return data;
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      if (status === 404) {
        const notFound = new Error(`Event ${eventId} not found`);
        notFound.status = 404;
        throw notFound;
      }
      logger.error("Event service error response", {
        eventId,
        status,
        data: err.response.data,
      });
      const serviceErr = new Error("Event service returned an error");
      serviceErr.status = 502;
      throw serviceErr;
    }
    logger.error("Event service unreachable", { eventId, error: err.message });
    const connErr = new Error("Event service unavailable");
    connErr.status = 503;
    throw connErr;
  }
};

module.exports = { getEvent };
