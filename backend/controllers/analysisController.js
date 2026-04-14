const QuizAttempt = require('../models/QuizAttempt');

exports.analyzePerformance = async (req, res) => {
  try {
    const { attemptId } = req.body;
    const attempt = await QuizAttempt.findById(attemptId);
    
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    // AI-like logic to determine mistake type (if not already set)
    let mistakeType = 'None';
    if (!attempt.isCorrect) {
      if (attempt.timeTaken < 15) mistakeType = 'Silly Mistake';
      else if (attempt.answerChanges > 3) mistakeType = 'Conceptual Confusion';
      else mistakeType = 'Knowledge Gap';
    }

    res.json({
      correctness: attempt.isCorrect,
      timeTaken: attempt.timeTaken,
      mistakeType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
