const express = require('express');
const router = express.Router();
const mistakeController = require('../controllers/mistakeController');

router.post('/check-repeated', mistakeController.checkRepeatedMistake);

module.exports = router;
