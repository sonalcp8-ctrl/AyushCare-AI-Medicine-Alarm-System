const express = require('express');
const router = express.Router();
const { register, login, getMe, linkPatient, demoLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/link-patient', protect, linkPatient);
router.post('/demo-login', demoLogin);

module.exports = router;
