const ChatSession = require('../models/ChatSession');
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

exports.sendMessage = async (req, res) => {
  try {
    const { userId, message, topic } = req.body;
    console.log(`[CHAT] Message received from user: ${userId}, message: ${message}`);

    const openai = getOpenAI();
    if (!openai) {
      console.warn("[WARNING] AI_API_KEY is missing! Using BOT fallback.");
      return res.status(200).json({ 
        response: `[DEMO BOT] I see you said: "${message}". Please insert your AI_API_KEY in .env to get full AI tutoring!` 
      });
    }

    let session = await ChatSession.findOne({ userId, topic });
    if (!session) {
      session = new ChatSession({ userId, topic, messages: [] });
    }

    session.messages.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: `You are a helpful AI tutor for Learnova. Explain ${topic} simply.` },
        ...session.messages.map(m => ({ role: m.role, content: m.content })),
      ]
    });

    const botResponse = completion.choices[0].message.content;
    console.log("[CHAT] AI Response generated successfully.");
    session.messages.push({ role: 'assistant', content: botResponse });
    session.lastUpdated = Date.now();
    
    await session.save();
    console.log(`[DATABASE] ChatSession saved for topic: ${topic}`);
    res.json({ response: botResponse });
  } catch (error) {
    console.error("[CHAT] AI ERROR:", error.message);
    res.status(500).json({ message: "AI Error: " + error.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    const history = await ChatSession.find({ userId }).sort({ lastUpdated: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.summarizeChat = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await ChatSession.findById(sessionId);
    
    if (!process.env.AI_API_KEY) {
      return res.json({ summary: "Demo Summary: Student learned about the core concepts effectively." });
    }

    const textToSummarize = session.messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: `Summarize this tutoring session focusing on what the student learned: \n${textToSummarize}` }]
    });

    session.summary = completion.choices[0].message.content;
    await session.save();
    res.json({ summary: session.summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
