const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

router.post('/analyze', analysisController.analyzePerformance);

module.exports = router;
