const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      default: 'रामेश्वर दयाल (दादाजी)',
    },
    patientAge: {
      type: Number,
      default: 72,
    },
    gender: {
      type: String,
      default: 'Male',
    },
    bloodGroup: {
      type: String,
      default: 'B+',
    },
    chronicConditions: {
      type: [String],
      default: ['High Blood Pressure (हाइपरटेंशन)', 'Type 2 Diabetes (डायबिटीज)', 'Joint Pain (जोड़ों का दर्द)'],
    },
    allergies: {
      type: [String],
      default: ['Penicillin', 'Sulfa drugs'],
    },
    doctorContact: {
      name: { type: String, default: 'Dr. S. K. Gupta (MD Physician)' },
      phone: { type: String, default: '+91 98110 54321' },
      hospital: { type: String, default: 'City Hospital, New Delhi' },
    },
    caretakerName: {
      type: String,
      default: 'अमित दयाल (बेटा / Caretaker)',
    },
    caretakerRelationship: {
      type: String,
      default: 'Son',
    },
    caretakerPhone: {
      type: String,
      default: '+91 98765 43210',
    },
    caretakerEmail: {
      type: String,
      default: 'caretaker@example.com',
    },
    voiceSettings: {
      language: { type: String, default: 'hi-IN' }, // 'hi-IN' or 'en-US'
      speechRate: { type: Number, default: 0.9 }, // Slower for elders
      voiceVolume: { type: Number, default: 1.0 },
      autoSpeakAlarm: { type: Boolean, default: true },
      autoSpeakMissed: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
