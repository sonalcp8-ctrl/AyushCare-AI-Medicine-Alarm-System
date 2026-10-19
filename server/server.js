const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const medicineRoutes = require('./routes/medicineRoutes');
const doseRoutes = require('./routes/doseRoutes');
const aiRoutes = require('./routes/aiRoutes');
const profileRoutes = require('./routes/profileRoutes');
const alertRoutes = require('./routes/alertRoutes');
const authRoutes = require('./routes/authRoutes');
const { seedDatabaseIfEmpty } = require('./utils/seedData');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medicine_alarm_db';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'AI Senior Medicine Alarm & Caretaker System',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/doses', doseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/alerts', alertRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Database connection & Server start
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log(`✅ MongoDB Connected successfully to: ${MONGODB_URI}`);
    await seedDatabaseIfEmpty();
    app.listen(PORT, () => {
      console.log(`🚀 AI Medicine Alarm Server running on: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Allow server to run even if Mongo has an initial hiccup
    app.listen(PORT, () => {
      console.log(`⚠️ Server running on port ${PORT} (Mongo offline mode)`);
    });
  });
