const Profile = require('../models/Profile');

// Get profile (creates default if none exists)
exports.getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({
        patientName: 'रामेश्वर दयाल (दादाजी)',
        patientAge: 72,
        gender: 'Male',
        bloodGroup: 'B+',
        chronicConditions: ['High Blood Pressure (हाइपरटेंशन)', 'Type 2 Diabetes (डायबिटीज)'],
        allergies: ['Penicillin'],
        caretakerName: 'अमित दयाल (बेटा)',
        caretakerRelationship: 'Son',
        caretakerPhone: '+91 98765 43210',
        caretakerEmail: 'caretaker@example.com',
      });
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile(req.body);
    } else {
      Object.assign(profile, req.body);
    }
    await profile.save();
    res.json({ success: true, data: profile, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
