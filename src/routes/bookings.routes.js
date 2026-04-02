const express = require("express");
const { body, param } = require("express-validator");

const { authenticate, requireAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingsByEvent,
  getBookingById,
  cancelBooking,
} = require("../controllers/booking.controller");
const { batchAvailability } = require("../controllers/availability.controller");

const router = express.Router();

/**
 * Public: remaining seats per event (capacity passed from event service data).
 */
router.post(
  "/api/public/availability/batch",
  [
    body("items").isArray({ min: 1 }).withMessage("items must be a non-empty array"),
    body("items.*.eventId").notEmpty().withMessage("eventId is required"),
    body("items.*.capacity").isInt({ min: 0 }).withMessage("capacity must be a non-negative integer"),
  ],
  validate,
  batchAvailability
);

/**
 * @openapi
 * /api/bookings:
 *   post:
 *     summary: Book a ticket for an event (authenticated users)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId, ticketCount]
 *             properties:
 *               eventId:
 *                 type: string
 *               ticketCount:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Event is fully booked
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.post(
  "/api/bookings",
  authenticate,
  [
    body("eventId").isMongoId().withMessage("eventId must be a valid MongoDB ObjectId"),
    body("ticketCount").isInt({ min: 1, max: 20 }).withMessage("ticketCount must be between 1 and 20"),
  ],
  validate,
  createBooking
);

/**
 * @openapi
 * /api/bookings/my:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *       401:
 *         description: Unauthorized
 */
router.get("/api/bookings/my", authenticate, getMyBookings);

/**
 * @openapi
 * /api/bookings/all:
 *   get:
 *     summary: Get all bookings across all users (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *         description: Optional filter by event ID
 *     responses:
 *       200:
 *         description: All bookings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
router.get("/api/bookings/all", authenticate, requireAdmin, getAllBookings);

/**
 * @openapi
 * /api/bookings/event/{eventId}:
 *   get:
 *     summary: Get all bookings for a specific event (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bookings for the event
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
router.get(
  "/api/bookings/event/:eventId",
  authenticate,
  requireAdmin,
  [param("eventId").isMongoId().withMessage("eventId must be a valid MongoDB ObjectId")],
  validate,
  getBookingsByEvent
);

/**
 * @openapi
 * /api/bookings/{id}:
 *   get:
 *     summary: Get a single booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.get(
  "/api/bookings/:id",
  authenticate,
  [param("id").isMongoId().withMessage("id must be a valid MongoDB ObjectId")],
  validate,
  getBookingById
);

/**
 * @openapi
 * /api/bookings/{id}:
 *   delete:
 *     summary: Cancel a booking (owner or admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Booking already cancelled
 */
router.delete(
  "/api/bookings/:id",
  authenticate,
  [param("id").isMongoId().withMessage("id must be a valid MongoDB ObjectId")],
  validate,
  cancelBooking
);

module.exports = router;
