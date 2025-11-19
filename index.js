require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const workersRoute = require("./routes/workers");
const authRoute = require("./routes/auth");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api/workers", workersRoute);
app.use("/api/auth", authRoute);

// Protected route example: current user
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  // req.user contains { id, email }
  res.json({ user: req.user });
});

app.get("/", (req, res) => res.send("SmartServe API running 🚀"));

(async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smartserve";
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
})();
