const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'Blood Pressure',
        'Diabetes',
        'Heart & Cardiac',
        'Pain & Arthritis',
        'Thyroid',
        'Digestion & Acidity',
        'Vitamins & Calcium',
        'Eye / Ear Drops',
        'Respiratory / Asthma',
        'Other',
      ],
      default: 'Other',
    },
    dosage: {
      type: String,
      required: true,
      default: '1 Tablet',
    },
    form: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Eye Drops', 'Inhaler', 'Ointment'],
      default: 'Tablet',
    },
    color: {
      type: String,
      enum: ['White', 'Blue', 'Red', 'Yellow', 'Green', 'Pink', 'Orange', 'Brown', 'Other'],
      default: 'White',
    },
    shape: {
      type: String,
      enum: ['Round', 'Oval', 'Capsule', 'Oblong', 'Square', 'Liquid Bottle', 'Drop Bottle'],
      default: 'Round',
    },
    instructions: {
      type: String,
      enum: [
        'Before Food (खाली पेट)',
        'After Breakfast (नाश्ते के बाद)',
        'After Lunch (दोपहर के खाने के बाद)',
        'After Dinner (रात के खाने के बाद)',
        'With Warm Water (गुनगुने पानी से)',
        'Before Sleep (सोने से पहले)',
        'As Needed (जरूरत पड़ने पर / SOS)',
      ],
      default: 'After Breakfast (नाश्ते के बाद)',
    },
    frequency: {
      type: String,
      enum: ['Once Daily', 'Twice Daily', 'Thrice Daily', 'Every 8 Hours', 'Every Alternate Day', 'SOS / As Needed'],
      default: 'Once Daily',
    },
    alarmTimes: {
      type: [String], // Array of "HH:mm" in 24h e.g. ["08:00", "20:00"]
      required: true,
      default: ['08:00'],
    },
    hindiVoicePrompt: {
      type: String,
      default: '',
    },
    stockCount: {
      type: Number,
      default: 30,
      min: 0,
    },
    refillThreshold: {
      type: Number,
      default: 5,
    },
    doctorName: {
      type: String,
      default: '',
    },
    sideEffectsWarning: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
