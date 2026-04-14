const StudyPlan = require('../models/StudyPlan');
const Performance = require('../models/Performance');
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

exports.explainAnswer = async (req, res) => {
  try {
    const { question, userAnswer, correctAnswer, topic } = req.body;
    console.log(`[AI] Generating explanation for topic: ${topic}`);

    const openai = getOpenAI();
    if (!openai) {
      return res.json({ explanation: "Demo Explanation: The logic behind this answer involves efficient memory management and pattern recognition." });
    }
    
    const prompt = `Topic: ${topic}\nQuestion: ${question}\nUser's Answer: ${userAnswer}\nCorrect Answer: ${correctAnswer}\n\nProvide a deep, conceptually clear explanation for why the answer is ${correctAnswer} and analyze the user's specific mistake.`;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ explanation: completion.choices[0].message.content });
  } catch (error) {
    console.error(`[AI ERROR] explainAnswer: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

exports.generateStudyPlan = async (req, res) => {
  try {
    const { userId, weekCount = 4 } = req.body;
    console.log(`[AI] Generating study plan for user: ${userId}`);

    const openai = getOpenAI();
    if (!openai) {
      console.warn("[AI] No API Key. Returning demo roadmap.");
      return res.json({
        plan: [
          { day: 1, topic: "Fundamentals & Logic", focus: "Basic syntax and problem solving" },
          { day: 2, topic: "Data Structures Intro", focus: "Arrays and Linked Lists" },
          { day: 3, topic: "Algorithm Analysis", focus: "Time & Space complexity" }
        ]
      });
    }

    const performance = await Performance.find({ userId });
    const userSummary = performance.map(p => `${p.topic}: ${p.accuracy}% accuracy`).join(', ');

    const prompt = `Generate a personalized ${weekCount}-week study plan for a student with this performance: ${userSummary || 'New student'}. Focus on weakest areas. Return JSON { plan: [{day, topic, focus}] }`;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const planData = JSON.parse(completion.choices[0].message.content);
    
    await StudyPlan.findOneAndUpdate(
      { userId },
      { planData, lastUpdated: Date.now() },
      { upsert: true }
    );
    console.log(`[DATABASE] Study plan saved for user: ${userId}`);

    res.json(planData);
  } catch (error) {
    console.error(`[AI ERROR] generateStudyPlan: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

exports.generateMicroLesson = async (req, res) => {
  try {
    const { topic } = req.body;
    console.log(`[AI] Creating micro-lesson for: ${topic}`);

    const openai = getOpenAI();
    if (!openai) {
      return res.json({ lesson: `### Lesson on ${topic}\n\n1. Concept... \n2. Pattern... \n3. Solution...` });
    }
    
    const prompt = `Create a 2-minute micro-lesson on "${topic}". Focus on the core concept that students often get wrong. Use Markdown formatting.`;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ lesson: completion.choices[0].message.content });
  } catch (error) {
    console.error(`[AI ERROR] generateMicroLesson: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};
