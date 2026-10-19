const Medicine = require('../models/Medicine');
const DoseLog = require('../models/DoseLog');
const {
  analyzeMedicineSafety,
  generateHindiVoicePrompt,
  parsePrescriptionText,
  answerElderVoiceQuery,
} = require('../utils/aiHelper');

/**
 * AI Safety Check for New or Updated Medicine
 */
exports.checkSafety = async (req, res) => {
  try {
    const { name, category, dosage, instructions } = req.body;
    const activeMeds = await Medicine.find({ isActive: true });

    const analysis = analyzeMedicineSafety(
      { name, category, dosage, instructions },
      activeMeds
    );

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * AI Prescription / Doctor Notes Parser
 */
exports.parsePrescription = async (req, res) => {
  try {
    const { prescriptionText } = req.body;
    if (!prescriptionText) {
      return res.status(400).json({ success: false, error: 'Please provide prescription text' });
    }

    const structuredMed = parsePrescriptionText(prescriptionText);
    res.json({
      success: true,
      data: structuredMed,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * AI Voice Query (for Elder voice questions)
 */
exports.handleVoiceQuery = async (req, res) => {
  try {
    const { query } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    const activeMeds = await Medicine.find({ isActive: true });
    const doseLogsToday = await DoseLog.find({ scheduledDate: todayStr });

    const answer = answerElderVoiceQuery(query, activeMeds, doseLogsToday);

    res.json({
      success: true,
      data: answer,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
