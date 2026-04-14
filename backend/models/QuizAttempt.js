const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: String,
  topic: String,
  userAnswer: String,
  correctAnswer: String,
  timeTaken: Number,
  answerChanges: Number,
  isCorrect: Boolean,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
