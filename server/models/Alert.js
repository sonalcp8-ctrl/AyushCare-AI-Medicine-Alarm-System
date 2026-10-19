const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['missed_medicine', 'alarm_triggered', 'emergency_sos', 'low_stock', 'system'],
      default: 'missed_medicine',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    medicineName: {
      type: String,
      default: '',
    },
    scheduledTime: {
      type: String,
      default: '',
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'warning',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionTaken: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
