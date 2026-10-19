const express = require('express');
const router = express.Router();
const {
  getAllAlerts,
  markAsRead,
  triggerSOS,
  clearAllAlerts,
} = require('../controllers/alertController');

router.get('/', getAllAlerts);
router.put('/:id/read', markAsRead);
router.post('/sos', triggerSOS);
router.post('/clear-all', clearAllAlerts);

module.exports = router;
