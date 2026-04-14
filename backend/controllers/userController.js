const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log(`[AUTH] Attempting signup for email: ${email}`);

    let user = await User.findOne({ email });
    if (user) {
      console.warn(`[AUTH] Signup failed: User ${email} already exists.`);
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ email, password, name: name || email });
    await user.save();
    console.log(`[DATABASE] New user profile created for: ${email}`);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, userId: user._id, email: user.email });
  } catch (error) {
    console.error(`[AUTH] Signup Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[AUTH] Login failed: User ${email} not found.`);
      return res.status(400).json({ message: 'Account not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[AUTH] Login failed: Wrong password for ${email}.`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    console.log(`[AUTH] Login success! Session restored for user: ${email}`);

    res.json({ 
      token, 
      userId: user._id, 
      email: user.email,
      onboardingData: user.onboardingData 
    });
  } catch (error) {
    console.error(`[AUTH] Login Error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

exports.onboarding = async (req, res) => {
  try {
    const { userId, onboardingData } = req.body;
    console.log(`[STUDENT PROFILE] Saving onboarding data for user ID: ${userId}`);
    
    const user = await User.findByIdAndUpdate(userId, { onboardingData }, { new: true });
    console.log(`[DATABASE] User profile updated with goals and background.`);
    
    res.json({ message: 'Success', onboardingData: user.onboardingData });
  } catch (error) {
    console.error(`[PROFILE ERROR] ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};
