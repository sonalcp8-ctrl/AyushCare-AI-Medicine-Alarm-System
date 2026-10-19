const mongoose = require('mongoose');

const doseLogSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    medicineName: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      default: '1 Tablet',
    },
    scheduledDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    scheduledTime: {
      type: String, // HH:mm
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'taken', 'missed', 'snoozed'],
      default: 'pending',
    },
    takenAt: {
      type: Date,
      default: null,
    },
    snoozedUntil: {
      type: Date,
      default: null,
    },
    missedReason: {
      type: String,
      default: '',
    },
    voiceSpokenOnMissed: {
      type: Boolean,
      default: false,
    },
    caretakerAlertSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

doseLogSchema.index({ scheduledDate: 1, scheduledTime: 1, medicineId: 1 });

module.exports = mongoose.model('DoseLog', doseLogSchema);
