const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'ayushcare_super_secret_jwt_key_2026';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * Register User (Patient or Caretaker)
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, age, linkedPatientCode, preferredLanguage } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'कृपया नाम, ईमेल/यूज़र आईडी और पासवर्ड भरें (Please provide name, email and password)',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'यह ईमेल/यूज़र आईडी पहले से पंजीकृत है (This email/user ID is already registered)',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'patient',
      phone: phone || '',
      age: age || (role === 'patient' ? 72 : 35),
      preferredLanguage: preferredLanguage || 'hi',
    });

    // If caretaker provided a patientCode during register, link them
    if (user.role === 'caretaker' && linkedPatientCode) {
      const patient = await User.findOne({ patientCode: linkedPatientCode.toUpperCase(), role: 'patient' });
      if (patient) {
        user.linkedPatients.push(patient._id);
        user.linkedPatientCode = linkedPatientCode.toUpperCase();
        await user.save();

        patient.linkedCaretakers.push(user._id);
        await patient.save();
      }
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientCode: user.patientCode,
        phone: user.phone,
        age: user.age,
        preferredLanguage: user.preferredLanguage,
        linkedPatientCode: user.linkedPatientCode,
      },
      message: 'सफलतापूर्वक पंजीकरण हो गया! (Registered successfully)',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'कृपया ईमेल/यूज़र आईडी और पासवर्ड दोनों दर्ज करें (Please provide email and password)',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'अमान्य क्रेडेंशियल्स - यूज़र नहीं मिला (Invalid credentials - User not found)',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'गलत पासवर्ड (Incorrect password)',
      });
    }

    const token = generateToken(user._id);

    // Populate linked info if caretaker
    let linkedPatient = null;
    if (user.role === 'caretaker' && user.linkedPatients.length > 0) {
      linkedPatient = await User.findById(user.linkedPatients[0]).select('name age patientCode phone');
    }

    res.json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientCode: user.patientCode,
        phone: user.phone,
        age: user.age,
        preferredLanguage: user.preferredLanguage,
        linkedPatientCode: user.linkedPatientCode,
        linkedPatient,
      },
      message: 'लॉगिन सफल रहा! (Login successful)',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('linkedPatients', 'name age patientCode phone');
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Link Caretaker to Patient using Patient Code
 * POST /api/auth/link-patient
 */
exports.linkPatient = async (req, res) => {
  try {
    const { patientCode } = req.body;
    if (!patientCode) {
      return res.status(400).json({ success: false, error: 'कृपया पेशेंट कोड दर्ज करें (Patient code is required)' });
    }

    const patient = await User.findOne({ patientCode: patientCode.toUpperCase().trim(), role: 'patient' });
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'यह पेशेंट कोड नहीं मिला। कृपया दादाजी के स्क्रीन पर लिखा कोड चेक करें (Patient code not found)',
      });
    }

    const caretaker = await User.findById(req.user.id);
    if (!caretaker) {
      return res.status(404).json({ success: false, error: 'Caretaker not found' });
    }

    if (!caretaker.linkedPatients.includes(patient._id)) {
      caretaker.linkedPatients.push(patient._id);
      caretaker.linkedPatientCode = patient.patientCode;
      await caretaker.save();
    }

    if (!patient.linkedCaretakers.includes(caretaker._id)) {
      patient.linkedCaretakers.push(caretaker._id);
      await patient.save();
    }

    res.json({
      success: true,
      message: `सफलतापूर्वक पेशेंट ${patient.name} (${patient.patientCode}) से लिंक हो गया!`,
      data: {
        patientId: patient._id,
        patientName: patient.name,
        patientCode: patient.patientCode,
        patientAge: patient.age,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 1-Click Demo Login (Instant testing for Senior or Caretaker)
 * POST /api/auth/demo-login
 */
exports.demoLogin = async (req, res) => {
  try {
    const { role } = req.body; // 'patient' or 'caretaker'
    const targetRole = role === 'caretaker' ? 'caretaker' : 'patient';

    let user = await User.findOne({ role: targetRole });

    if (!user) {
      // Create default user if not exists
      if (targetRole === 'patient') {
        user = await User.create({
          name: 'रामेश्वर दयाल (दादाजी)',
          email: 'dadaji@ayushcare.com',
          password: 'password123',
          role: 'patient',
          age: 72,
          phone: '+91 98110 54321',
          patientCode: 'ELD-7201',
          preferredLanguage: 'hi',
        });
      } else {
        user = await User.create({
          name: 'अमित दयाल (केयरटेकर बेटा)',
          email: 'caretaker@ayushcare.com',
          password: 'password123',
          role: 'caretaker',
          age: 40,
          phone: '+91 98765 43210',
          linkedPatientCode: 'ELD-7201',
          preferredLanguage: 'hi',
        });
      }
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientCode: user.patientCode,
        phone: user.phone,
        age: user.age,
        preferredLanguage: user.preferredLanguage,
        linkedPatientCode: user.linkedPatientCode,
      },
      message: `${user.name} के रूप में डेमो लॉगिन सफल!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
