const QuizAttempt = require('../models/QuizAttempt');
const Performance = require('../models/Performance');
const Mistake = require('../models/Mistake');
const User = require('../models/User');
const { OpenAI } = require('openai');

const getOpenAI = () => {
  if (!process.env.AI_API_KEY) return null;
  return new OpenAI({ 
    apiKey: process.env.AI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:8080",
      "X-Title": "Learnova AI",
    }
  });
};

exports.generateQuestion = async (req, res) => {
  try {
    const { topic, difficulty, userId } = req.body;
    console.log(`[QUIZ] Generating question for user: ${userId}, topic: ${topic}`);

    const openai = getOpenAI();
    if (!openai) {
      console.warn("[WARNING] AI_API_KEY is missing! Using fallback question.");
      return res.status(200).json({
        question: "Example Question: What is the benefit of a clean architecture?",
        options: ["Scalability", "Confusion", "Bugs", "Cost"],
        correctAnswer: "Scalability",
        explanation: "Clean architecture helps in maintaining code and scalability.",
        topic: topic || "General"
      });
    }

    const user = await User.findById(userId);
    const profileSummary = user ? JSON.stringify(user.onboardingData) : "Generic Student";

    const prompt = `Generate a unique mcq on "${topic}" for level "${difficulty}". Format: JSON {question, options, correctAnswer, explanation}`;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const questionData = JSON.parse(completion.choices[0].message.content);
    console.log("[QUIZ] AI Question Generated Successfully.");
    res.status(200).json({ ...questionData, topic: topic || "General" });
  } catch (error) {
    console.error("[QUIZ] AI ERROR:", error.message);
    res.status(500).json({ message: "AI Error: " + error.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { userId, question, topic, userAnswer, correctAnswer, timeTaken, answerChanges } = req.body;
    const isCorrect = userAnswer === correctAnswer;

    console.log(`[QUIZ] Submitting answer for user: ${userId}, topic: ${topic}, correct: ${isCorrect}`);

    const attempt = new QuizAttempt({
      userId, question, topic, userAnswer, correctAnswer, timeTaken, answerChanges, isCorrect
    });
    
    await attempt.save();
    console.log(`[DATABASE] QuizAttempt saved for user: ${userId}`);

    const attempts = await QuizAttempt.find({ userId, topic });
    const accuracy = (attempts.filter(a => a.isCorrect).length / attempts.length) * 100;
    
    const avgTime = attempts.reduce((acc, curr) => acc + curr.timeTaken, 0) / attempts.length;
    const avgChanges = attempts.reduce((acc, curr) => acc + curr.answerChanges, 0) / attempts.length;
    let confidenceScore = Math.max(0, 100 - (avgTime / 2) - (avgChanges * 10));

    await Performance.findOneAndUpdate(
      { userId, topic },
      { accuracy, confidenceScore, lastUpdated: Date.now() },
      { upsert: true, new: true }
    );
    console.log(`[DATABASE] Performance updated for topic: ${topic}`);

    if (!isCorrect) {
      let mistakeType = timeTaken < 15 ? "Silly Mistake" : "Conceptual";
      await Mistake.findOneAndUpdate(
        { userId, topic, mistakeType },
        { $inc: { count: 1 }, lastOccurrence: Date.now() },
        { upsert: true, new: true }
      );
      console.log(`[DATABASE] Mistake recorded for topic: ${topic}`);
    }

    res.status(201).json({ success: true, isCorrect, correctAnswer });
  } catch (error) {
    console.error("[QUIZ] SUBMISSION ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};
