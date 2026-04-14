const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: String,
  messages: [ChatMessageSchema],
  summary: String,
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
