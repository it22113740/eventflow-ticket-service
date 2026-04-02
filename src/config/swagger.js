const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EventFlow Ticket Service API",
      version: "1.0.0",
      description: "Ticket booking microservice for EventFlow platform",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5003}`,
        description: "Local development",
      },
      {
        url: `https://eventflow-ticket-service-latest.onrender.com`,
        description: "Production",
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Booking: {
          type: "object",
          properties: {
            _id: { type: "string", example: "664a1f2e3b4c5d6e7f8a9b0c" },
            userId: { type: "string", example: "664a1f2e3b4c5d6e7f8a9b0a" },
            eventId: { type: "string", example: "664a1f2e3b4c5d6e7f8a9b0b" },
            status: {
              type: "string",
              enum: ["confirmed", "cancelled"],
              example: "confirmed",
            },
            ticketCount: { type: "integer", example: 2 },
            bookedAt: {
              type: "string",
              format: "date-time",
              example: "2026-04-02T10:00:00.000Z",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
            errors: { type: "array", items: { type: "object" } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
