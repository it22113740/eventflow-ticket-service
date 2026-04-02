require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const connectDB = require("./config/db");
const swaggerSpec = require("./config/swagger");
const logger = require("./utils/logger");
const { errorHandler } = require("./middleware/errorHandler");

const healthRoutes = require("./routes/health.routes");
const bookingRoutes = require("./routes/bookings.routes");

const app = express();
const SERVICE_NAME = process.env.SERVICE_NAME || "eventflow-ticket-service";

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// ── Request logging ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ── Docs ──────────────────────────────────────────────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use(healthRoutes);
app.use(bookingRoutes);

// 404 catch-all
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Boot ──────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT || 5003);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`${SERVICE_NAME} listening on port ${PORT}`);
    logger.info(`Swagger docs: http://localhost:${PORT}/api/docs`);
  });
};

start().catch((err) => {
  logger.error("Failed to start service", { error: err.message });
  process.exit(1);
});
