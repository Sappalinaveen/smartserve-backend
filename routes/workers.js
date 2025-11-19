const express = require("express");
const router = express.Router();
const Worker = require("../models/Worker");

// POST — add a new worker
router.post("/", async (req, res) => {
  try {
    const { name, contact, timing, serviceName, charges, address } = req.body;
    if (!name || !contact || !serviceName) return res.status(400).json({ message: "Name, contact and service are required." });
    const worker = new Worker({ name, contact, timing, serviceName, charges, address });
    await worker.save();
    res.status(201).json({ message: "Worker registered", worker });
  } catch (err) {
    console.error("Error saving worker:", err);
    if (err.code === 11000) return res.status(409).json({ message: "Worker with this contact & service already exists." });
    res.status(500).json({ message: "Server error" });
  }
});

// GET — list workers
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.serviceName) {
      // Case-insensitive match
      filter.serviceName = { $regex: new RegExp(req.query.serviceName, "i") };
    }

    const workers = await Worker.find(filter).sort({ createdAt: -1 });
    res.json({ workers });
  } catch (err) {
    console.error("Error fetching workers:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
