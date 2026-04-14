const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/explain-answer', aiController.explainAnswer);
router.post('/generate-plan', aiController.generateStudyPlan);
router.post('/generate-micro-lesson', aiController.generateMicroLesson);

module.exports = router;
