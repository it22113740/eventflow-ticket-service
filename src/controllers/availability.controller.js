const mongoose = require("mongoose");
const Booking = require("../models/Booking");

/**
 * POST /api/public/availability/batch
 * Body: { items: [{ eventId: string, capacity: number }] }
 * Returns remaining seats per event (no auth; capacity is supplied by client from event payload).
 */
const batchAvailability = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: true, data: {} });
    }
    if (items.length > 100) {
      return res.status(400).json({ message: "At most 100 items per request" });
    }

    const ids = [];
    const capMap = {};
    for (const it of items) {
      if (!it || !it.eventId) continue;
      const id = String(it.eventId);
      if (!mongoose.Types.ObjectId.isValid(id)) continue;
      ids.push(id);
      capMap[id] = Number(it.capacity) || 0;
    }

    if (ids.length === 0) {
      return res.json({ success: true, data: {} });
    }

    const oids = ids.map((id) => new mongoose.Types.ObjectId(id));
    const agg = await Booking.aggregate([
      { $match: { eventId: { $in: oids }, status: "confirmed" } },
      { $group: { _id: "$eventId", sold: { $sum: "$ticketCount" } } },
    ]);
    const soldMap = Object.fromEntries(agg.map((a) => [a._id.toString(), a.sold]));

    const data = {};
    for (const id of ids) {
      const cap = capMap[id] || 0;
      const sold = soldMap[id] || 0;
      data[id] = { availableSeats: Math.max(0, cap - sold) };
    }

    return res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { batchAvailability };
