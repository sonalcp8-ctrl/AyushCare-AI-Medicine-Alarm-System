const Alert = require('../models/Alert');

// Get all alerts (sorted by recent)
exports.getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Alert.countDocuments({ isRead: false });
    res.json({ success: true, count: alerts.length, unreadCount, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark alert as read
exports.markAsRead = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Trigger Emergency SOS from Senior screen
exports.triggerSOS = async (req, res) => {
  try {
    const { note } = req.body || {};
    const alert = await Alert.create({
      type: 'emergency_sos',
      title: '🚨 EMERGENCY SOS: दादाजी को तुरंत सहायता चाहिए!',
      message: note || 'दादाजी ने इमरजेंसी एसओएस बटन दबाया है। कृपया तुरंत संपर्क करें या पास पहुंचें!',
      severity: 'critical',
    });

    res.json({
      success: true,
      message: 'इमरजेंसी अलर्ट केयरटेकर को भेज दिया गया है!',
      data: alert,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Clear / dismiss all alerts
exports.clearAllAlerts = async (req, res) => {
  try {
    await Alert.updateMany({}, { isRead: true });
    res.json({ success: true, message: 'All alerts marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
