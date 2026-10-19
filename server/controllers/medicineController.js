const Medicine = require('../models/Medicine');
const DoseLog = require('../models/DoseLog');
const { analyzeMedicineSafety, generateHindiVoicePrompt } = require('../utils/aiHelper');

// Get all active medicines
exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single medicine
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, error: 'Medicine not found' });
    }
    res.json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new medicine
exports.createMedicine = async (req, res) => {
  try {
    const {
      name,
      genericName,
      category,
      dosage,
      form,
      color,
      shape,
      instructions,
      frequency,
      alarmTimes,
      stockCount,
      refillThreshold,
      doctorName,
      sideEffectsWarning,
      notes,
    } = req.body;

    // AI Safety & Interaction Analysis
    const existingMeds = await Medicine.find({ isActive: true });
    const aiAnalysis = analyzeMedicineSafety(req.body, existingMeds);

    // Auto generate Hindi voice prompt if not provided
    const hindiVoicePrompt = req.body.hindiVoicePrompt || generateHindiVoicePrompt(req.body);

    const medicine = new Medicine({
      name,
      genericName,
      category,
      dosage: dosage || '1 Tablet',
      form: form || 'Tablet',
      color: color || 'White',
      shape: shape || 'Round',
      instructions: instructions || 'After Breakfast (नाश्ते के बाद)',
      frequency: frequency || 'Once Daily',
      alarmTimes: alarmTimes && alarmTimes.length > 0 ? alarmTimes : ['08:00'],
      hindiVoicePrompt,
      stockCount: stockCount !== undefined ? Number(stockCount) : 30,
      refillThreshold: refillThreshold !== undefined ? Number(refillThreshold) : 5,
      doctorName,
      sideEffectsWarning: sideEffectsWarning || (aiAnalysis.warnings[0] ? aiAnalysis.warnings[0].message : ''),
      notes,
    });

    const saved = await medicine.save();

    // Create today's dose log for this medicine
    const todayStr = new Date().toISOString().split('T')[0];
    for (const time of saved.alarmTimes) {
      await DoseLog.create({
        medicineId: saved._id,
        medicineName: saved.name,
        dosage: saved.dosage,
        scheduledDate: todayStr,
        scheduledTime: time,
        status: 'pending',
      });
    }

    res.status(201).json({
      success: true,
      data: saved,
      aiAnalysis,
      message: 'Medicine added successfully with AI voice alarm prompt!',
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update medicine
exports.updateMedicine = async (req, res) => {
  try {
    const updated = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Medicine not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Soft delete medicine
exports.deleteMedicine = async (req, res) => {
  try {
    const med = await Medicine.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!med) {
      return res.status(404).json({ success: false, error: 'Medicine not found' });
    }
    res.json({ success: true, message: 'Medicine removed from active schedule' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Refill alerts
exports.getRefillAlerts = async (req, res) => {
  try {
    const lowStockMeds = await Medicine.find({
      isActive: true,
      $expr: { $lte: ['$stockCount', '$refillThreshold'] },
    });
    res.json({ success: true, count: lowStockMeds.length, data: lowStockMeds });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
