const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

router.post('/generate-question', quizController.generateQuestion);
router.post('/submit-answer', quizController.submitAnswer);

module.exports = router;
