const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contact: { type: String, required: true, trim: true },
  timing: { type: String },
  serviceName: { type: String, required: true, trim: true },
  charges: { type: Number },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
});

workerSchema.index({ contact: 1, serviceName: 1 }, { unique: true });

module.exports = mongoose.model("Worker", workerSchema);
