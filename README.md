# eventflow-ticket-service

Ticket booking microservice for the EventFlow platform. Handles booking creation, retrieval, and cancellation with JWT-protected endpoints.

## Stack

- **Runtime**: Node.js 20 + Express
- **Database**: MongoDB via Mongoose
- **Auth**: JWT validation middleware
- **Validation**: express-validator
- **Docs**: Swagger UI (`/api/docs`)
- **Logging**: Winston (structured JSON)
- **Inter-service**: Axios (Event Service + Notification Service)

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/health` | - | Health check |
| `POST` | `/api/bookings` | JWT | Book a ticket |
| `GET` | `/api/bookings/my` | JWT | Current user's bookings |
| `GET` | `/api/bookings/:id` | JWT | Single booking |
| `DELETE` | `/api/bookings/:id` | JWT | Cancel booking |
| `GET` | `/api/docs` | - | Swagger UI |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your values

# 3. Run (development)
npm run dev

# 4. Run (production)
npm start
```

## Docker

```bash
# Build image
docker build -t eventflow-ticket-service .

# Run with docker-compose (requires eventflow-net network)
docker network create eventflow-net   # if not already created
docker-compose up -d
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5003` | HTTP port |
| `MONGO_URI` | - | MongoDB connection string |
| `JWT_SECRET` | - | Shared JWT signing secret |
| `EVENT_SERVICE_URL` | `http://event-service:5002` | Event Service base URL |
| `NOTIFICATION_SERVICE_URL` | `http://notification-service:5004` | Notification Service base URL |
| `LOG_LEVEL` | `info` | Winston log level |

## Inter-Service Communication

- **Event Service** (`GET /api/events/:id`): Called on booking creation to verify the event exists.
- **Notification Service** (`POST /api/notify`): Called after a successful booking with `BOOKING_CONFIRMED` payload. Failures are logged but do not fail the booking.

## Booking Model

```json
{
  "userId":      "ObjectId",
  "eventId":     "ObjectId",
  "status":      "confirmed | cancelled",
  "ticketCount": 1-20,
  "bookedAt":    "Date"
}
```
