const mongoose = require('mongoose');

const MistakeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: String,
  mistakeType: String,
  count: { type: Number, default: 1 },
  lastOccurrence: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mistake', MistakeSchema);
