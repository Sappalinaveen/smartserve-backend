require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const workersRoute = require("./routes/workers");
const authRoute = require("./routes/auth");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS: allow an explicit origin from env or fallback to localhost:3000
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
app.use(cors({ origin: allowedOrigin }));

// Parse JSON bodies
app.use(express.json());

// Routes
app.use("/api/workers", workersRoute);
app.use("/api/auth", authRoute);

// Protected route example: current user
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  // req.user contains { id, email } set by the auth middleware
  res.json({ user: req.user });
});

// Health-check / root
app.get("/", (req, res) => res.send("SmartServe API running 🚀"));

// Crash handlers for better logs
process.on("uncaughtException", (err) => {
  console.error("uncaughtException", err);
  // Optional: exit process after synchronous cleanup
  // process.exit(1);
});

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at:", p, "reason:", reason);
  // Optional: process.exit(1);
});

let server;

async function startServer() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.warn("MONGODB_URI is not set. Attempting to start without DB connection.");
    } else {
      // Use recommended options
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ MongoDB connected");
    }
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
    console.warn("⚠️ Starting server without DB connection (some routes may fail)");
  }

  server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  try {
    if (server) {
      server.close(() => {
        console.log("HTTP server closed.");
      });
    }
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected.");
    }
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();

module.exports = app; // useful for testing
