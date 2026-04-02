const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    logger.error("MONGO_URI is not defined");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    logger.info("MongoDB connected", { uri: uri.replace(/\/\/.*@/, "//***@") });
  } catch (err) {
    logger.error("MongoDB connection error", { error: err.message });
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () =>
    logger.warn("MongoDB disconnected")
  );
  mongoose.connection.on("error", (err) =>
    logger.error("MongoDB error", { error: err.message })
  );
};

module.exports = connectDB;
