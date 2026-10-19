const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email or User ID'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 4,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['patient', 'caretaker'],
      default: 'patient',
    },
    patientCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      default: '',
    },
    age: {
      type: Number,
      default: 70,
    },
    linkedPatientCode: {
      type: String,
      default: '',
    },
    linkedPatients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    linkedCaretakers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    preferredLanguage: {
      type: String,
      enum: ['hi', 'en'],
      default: 'hi',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate random patient code if not set for patients
userSchema.pre('save', function (next) {
  if (this.role === 'patient' && !this.patientCode) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.patientCode = `ELD-${randomNum}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
