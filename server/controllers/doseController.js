const DoseLog = require('../models/DoseLog');
const Medicine = require('../models/Medicine');
const Alert = require('../models/Alert');
const { generateMissedMedicineAlert } = require('../utils/aiHelper');

/**
 * Get or initialize today's doses for all active medicines
 */
exports.getTodayDoses = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const activeMedicines = await Medicine.find({ isActive: true });

    // Find existing logs for today
    let todayLogs = await DoseLog.find({ scheduledDate: todayStr }).populate('medicineId');

    // Create logs for any missing medicine or alarmTime
    const existingKeys = new Set(todayLogs.map((l) => `${l.medicineId ? l.medicineId._id.toString() : l.medicineId}_${l.scheduledTime}`));

    for (const med of activeMedicines) {
      for (const time of med.alarmTimes || []) {
        const key = `${med._id.toString()}_${time}`;
        if (!existingKeys.has(key)) {
          const newLog = await DoseLog.create({
            medicineId: med._id,
            medicineName: med.name,
            dosage: med.dosage,
            scheduledDate: todayStr,
            scheduledTime: time,
            status: 'pending',
          });
          const populated = await DoseLog.findById(newLog._id).populate('medicineId');
          todayLogs.push(populated);
        }
      }
    }

    // Sort by scheduledTime
    todayLogs.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

    // Calculate stats
    const total = todayLogs.length;
    const taken = todayLogs.filter((l) => l.status === 'taken').length;
    const missed = todayLogs.filter((l) => l.status === 'missed').length;
    const pending = todayLogs.filter((l) => l.status === 'pending' || l.status === 'snoozed').length;
    const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 100;

    res.json({
      success: true,
      data: {
        date: todayStr,
        stats: { total, taken, missed, pending, adherenceRate },
        doses: todayLogs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Mark a dose as taken
 */
exports.markDoseTaken = async (req, res) => {
  try {
    const { id } = req.params;
    const dose = await DoseLog.findById(id);
    if (!dose) {
      return res.status(404).json({ success: false, error: 'Dose record not found' });
    }

    dose.status = 'taken';
    dose.takenAt = new Date();
    await dose.save();

    // Decrement medicine stock count
    if (dose.medicineId) {
      await Medicine.findByIdAndUpdate(dose.medicineId, {
        $inc: { stockCount: -1 },
      });
    }

    res.json({
      success: true,
      message: 'दवाई ले ली गई है! शाबाश दादाजी!',
      data: dose,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Mark a dose as missed (either manually or automatic)
 */
exports.markDoseMissed = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const dose = await DoseLog.findById(id).populate('medicineId');
    if (!dose) {
      return res.status(404).json({ success: false, error: 'Dose record not found' });
    }

    dose.status = 'missed';
    dose.missedReason = reason || 'Dose skipped or missed';
    dose.voiceSpokenOnMissed = true;
    dose.caretakerAlertSent = true;
    await dose.save();

    // Generate voice speech text
    const voiceAlert = generateMissedMedicineAlert(dose.medicineName, dose.scheduledTime);

    // Create Caretaker Alert in database
    const alert = await Alert.create({
      type: 'missed_medicine',
      title: `⚠️ दवाई मिस हो गई: ${dose.medicineName}`,
      message: `दादाजी ने ${dose.scheduledTime} बजे की ${dose.medicineName} (${dose.dosage}) मिस कर दी है! कृपया चेक करें।`,
      medicineName: dose.medicineName,
      scheduledTime: dose.scheduledTime,
      severity: 'critical',
    });

    res.json({
      success: true,
      data: dose,
      voiceAlert,
      alert,
      message: 'दवाई मिस मार्क कर दी गई है और केयरटेकर को अलर्ट भेज दिया गया है।',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Snooze a dose by 10 minutes
 */
exports.snoozeDose = async (req, res) => {
  try {
    const { id } = req.params;
    const dose = await DoseLog.findById(id);
    if (!dose) {
      return res.status(404).json({ success: false, error: 'Dose record not found' });
    }

    const snoozeMinutes = req.body.minutes || 10;
    const snoozeTime = new Date(Date.now() + snoozeMinutes * 60 * 1000);

    dose.status = 'snoozed';
    dose.snoozedUntil = snoozeTime;
    await dose.save();

    res.json({
      success: true,
      message: `${snoozeMinutes} मिनट के लिए स्नूज़ किया गया। बाद में फिर याद दिलाएंगे।`,
      data: dose,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Check overdue doses and auto-detect missed medicines
 */
exports.checkOverdueDoses = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const pendingLogs = await DoseLog.find({
      scheduledDate: todayStr,
      status: { $in: ['pending', 'snoozed'] },
    }).populate('medicineId');

    const newlyMissed = [];

    const gracePeriod = req.query.grace !== undefined ? Number(req.query.grace) : 15;

    for (const log of pendingLogs) {
      const [h, m] = log.scheduledTime.split(':').map(Number);
      const scheduledMinutes = h * 60 + m;

      // Grace period after scheduled time
      if (currentMinutes > scheduledMinutes + gracePeriod) {
        log.status = 'missed';
        log.missedReason = `Auto-detected: ${gracePeriod} minutes grace period passed`;
        log.caretakerAlertSent = true;
        await log.save();

        const voiceAlert = generateMissedMedicineAlert(log.medicineName, log.scheduledTime);

        // Caretaker alert
        await Alert.create({
          type: 'missed_medicine',
          title: `⚠️ दवाई मिस हो गई: ${log.medicineName}`,
          message: `समय सीमा समाप्त: मरीज ने ${log.scheduledTime} बजे की दवाई ${log.medicineName} मिस कर दी है!`,
          medicineName: log.medicineName,
          scheduledTime: log.scheduledTime,
          severity: 'critical',
        });

        newlyMissed.push({
          log,
          voiceAlert,
        });
      }
    }

    res.json({
      success: true,
      newlyMissedCount: newlyMissed.length,
      data: newlyMissed,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get adherence history / logs
 */
exports.getAdherenceHistory = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;
    const logs = await DoseLog.find().sort({ scheduledDate: -1, scheduledTime: 1 }).limit(100);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
