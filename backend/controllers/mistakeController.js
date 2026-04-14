const Mistake = require('../models/Mistake');

exports.checkRepeatedMistake = async (req, res) => {
  try {
    const { userId, topic } = req.body;
    console.log(`[MISTAKE] Checking repeated patterns for ${userId} on topic: ${topic}`);

    const mistakes = await Mistake.find({ userId, topic });
    const totalMistakes = mistakes.reduce((acc, curr) => acc + curr.count, 0);

    if (totalMistakes > 0) {
      console.log(`[SYSTEM ALERT] Repeated mistake detected in "${topic}". Count: ${totalMistakes}`);
      return res.json({
        repeated: true,
        count: totalMistakes,
        message: `Careful! You have made ${totalMistakes} mistakes in "${topic}" so far. Want a quick lesson?`
      });
    }

    console.log(`[MISTAKE] No repeated patterns found for topic: ${topic}`);
    res.json({ repeated: false });
  } catch (error) {
    console.error(`[MISTAKE ERROR]: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};
