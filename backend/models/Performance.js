const mongoose = require('mongoose');

const PerformanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: String,
  accuracy: Number,
  confidenceScore: Number,
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Performance', PerformanceSchema);
