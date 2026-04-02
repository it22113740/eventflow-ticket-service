const getHealth = (req, res) => {
  res.status(200).json({
    status: "ok",
    service: process.env.SERVICE_NAME || "eventflow-ticket-service",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealth };
