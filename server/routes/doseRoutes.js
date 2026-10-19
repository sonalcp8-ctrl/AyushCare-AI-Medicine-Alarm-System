const express = require('express');
const router = express.Router();
const {
  getTodayDoses,
  markDoseTaken,
  markDoseMissed,
  snoozeDose,
  checkOverdueDoses,
  getAdherenceHistory,
} = require('../controllers/doseController');

router.get('/today', getTodayDoses);
router.get('/history', getAdherenceHistory);
router.post('/check-overdue', checkOverdueDoses);
router.put('/:id/taken', markDoseTaken);
router.put('/:id/missed', markDoseMissed);
router.put('/:id/snooze', snoozeDose);

module.exports = router;
