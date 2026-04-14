const Performance = require('../models/Performance');
const QuizAttempt = require('../models/QuizAttempt');

exports.getDashboardData = async (req, res) => {
  try {
    const { userId } = req.query;

    // Fast read from Performance collection
    const performanceData = await Performance.find({ userId });
    
    const overallReadiness = performanceData.length > 0
      ? performanceData.reduce((acc, curr) => acc + curr.accuracy, 0) / performanceData.length
      : 0;

    const weakTopics = performanceData
      .filter(p => p.accuracy < 60)
      .map(p => p.topic);

    // Heatmap still requires some aggregation but we can project just dates
    const attempts = await QuizAttempt.find({ userId }).select('timestamp');
    const heatmap = {};
    attempts.forEach(a => {
      const date = a.timestamp.toISOString().split('T')[0];
      heatmap[date] = (heatmap[date] || 0) + 1;
    });

    res.json({
      readinessScore: Math.round(overallReadiness),
      weakTopics,
      heatmapData: heatmap,
      performanceByTopic: performanceData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
