const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const { getEvent } = require("../services/eventService");
const { sendBookingConfirmation, sendBookingCancellation } = require("../services/notificationService");
const logger = require("../utils/logger");

// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { eventId, ticketCount } = req.body;
    const userId = req.user.id;

    // Verify event exists and get capacity
    const eventData = await getEvent(eventId);
    const event = eventData.data || eventData;
    const capacity = event.capacity;

    // Check capacity
    if (capacity != null) {
      const confirmedCount = await Booking.countDocuments({
        eventId: new mongoose.Types.ObjectId(eventId),
        status: "confirmed",
      });
      if (confirmedCount + ticketCount > capacity) {
        return res.status(400).json({ message: "Event is fully booked" });
      }
    }

    const booking = await Booking.create({
      userId: new mongoose.Types.ObjectId(userId),
      eventId: new mongoose.Types.ObjectId(eventId),
      ticketCount,
      status: "confirmed",
    });

    logger.info("Booking created", { bookingId: booking._id, userId, eventId });

    // Fire-and-forget notification
    sendBookingConfirmation({
      userId,
      userEmail: req.user.email,
      eventTitle: event.title || event.name || eventId,
      bookingId: booking._id.toString(),
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/my
const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ bookedAt: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/all — admin only
const getAllBookings = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.eventId) {
      filter.eventId = new mongoose.Types.ObjectId(req.query.eventId);
    }
    const bookings = await Booking.find(filter).sort({ bookedAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/event/:eventId — admin only
const getBookingsByEvent = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      eventId: new mongoose.Types.ObjectId(req.params.eventId),
    }).sort({ bookedAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Users may only view their own bookings; admins can view any
    if (booking.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/bookings/:id
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only owner or admin can cancel
    if (booking.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (booking.status === "cancelled") {
      return res.status(409).json({ message: "Booking is already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    logger.info("Booking cancelled", {
      bookingId: booking._id,
      cancelledBy: req.user.id,
    });

    // Fire-and-forget cancellation notification
    sendBookingCancellation({
      userId: booking.userId.toString(),
      userEmail: req.user.email,
      eventTitle: booking.eventId.toString(),
      bookingId: booking._id.toString(),
    });

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getMyBookings, getAllBookings, getBookingsByEvent, getBookingById, cancelBooking };
