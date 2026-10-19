const express = require('express');
const router = express.Router();
const {
  checkSafety,
  parsePrescription,
  handleVoiceQuery,
} = require('../controllers/aiController');

router.post('/safety-check', checkSafety);
router.post('/parse-prescription', parsePrescription);
router.post('/voice-query', handleVoiceQuery);

module.exports = router;
