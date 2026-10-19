const Medicine = require('../models/Medicine');
const DoseLog = require('../models/DoseLog');
const Profile = require('../models/Profile');
const Alert = require('../models/Alert');

const sampleMedicines = [
  {
    name: 'Amlodipine 5mg',
    genericName: 'Amlodipine Besylate',
    category: 'Blood Pressure',
    dosage: '1 Tablet',
    form: 'Tablet',
    color: 'Blue',
    shape: 'Round',
    instructions: 'After Breakfast (नाश्ते के बाद)',
    frequency: 'Once Daily',
    alarmTimes: ['09:00'],
    hindiVoicePrompt: 'नमस्ते दादाजी! 9:00 बज गए हैं। यह आपकी बीपी की नीली गोली अमलोडिपाइन लेने का समय है। नाश्ते के बाद पानी से लें।',
    stockCount: 24,
    refillThreshold: 5,
    doctorName: 'Dr. S. K. Gupta (MD Physician)',
    sideEffectsWarning: 'दवाई लेने के बाद अचानक बिस्तर से न उठें। 2 मिनट बैठें फिर खड़े हों ताकि चक्कर न आए।',
    notes: 'ब्लड प्रेशर को नॉर्मल रखने के लिए रोजाना लें।',
  },
  {
    name: 'Metformin 500mg',
    genericName: 'Metformin Hydrochloride',
    category: 'Diabetes',
    dosage: '1 Tablet',
    form: 'Tablet',
    color: 'White',
    shape: 'Oblong',
    instructions: 'After Breakfast (नाश्ते के बाद)',
    frequency: 'Twice Daily',
    alarmTimes: ['08:30', '20:30'],
    hindiVoicePrompt: 'दादाजी, आपकी शुगर की सफेद गोली मेटफॉर्मिन का समय हो गया है। भोजन के बाद लें।',
    stockCount: 18,
    refillThreshold: 6,
    doctorName: 'Dr. S. K. Gupta',
    sideEffectsWarning: 'खाली पेट ज्यादा देर न रहें। पास में हमेशा थोड़ा मीठा रखें।',
    notes: 'शुगर कंट्रोल करने के लिए।',
  },
  {
    name: 'Shelcal 500 (Calcium + D3)',
    genericName: 'Calcium Carbonate + Vitamin D3',
    category: 'Vitamins & Calcium',
    dosage: '1 Tablet',
    form: 'Tablet',
    color: 'White',
    shape: 'Oval',
    instructions: 'After Lunch (दोपहर के खाने के बाद)',
    frequency: 'Once Daily',
    alarmTimes: ['14:00'],
    hindiVoicePrompt: 'दादाजी, दोपहर 2 बजे हैं। आपकी हड्डियों की मजबूती के लिए शेल्कल कैल्शियम की गोली लेने का समय है।',
    stockCount: 4, // Intentionally low to demonstrate low-stock alert!
    refillThreshold: 5,
    doctorName: 'Dr. R. K. Verma (Orthopedic)',
    sideEffectsWarning: 'भरपेट पानी पिएं।',
    notes: 'हड्डियों और जोड़ों के दर्द के लिए। 4 गोलियां बची हैं (रीफिल की जरूरत)।',
  },
  {
    name: 'Atorvastatin 10mg',
    genericName: 'Atorvastatin Calcium',
    category: 'Heart & Cardiac',
    dosage: '1 Tablet',
    form: 'Tablet',
    color: 'Yellow',
    shape: 'Round',
    instructions: 'Before Sleep (सोने से पहले)',
    frequency: 'Once Daily',
    alarmTimes: ['21:30'],
    hindiVoicePrompt: 'दादाजी, रात को सोने से पहले दिल की सुरक्षा वाली पीली गोली एटोरवास्टेटिन लेने का समय है।',
    stockCount: 28,
    refillThreshold: 5,
    doctorName: 'Dr. S. K. Gupta',
    sideEffectsWarning: 'रात को गुनगुने पानी के साथ लें।',
    notes: 'कोलेस्ट्रॉल और हृदय सुरक्षा।',
  },
];

async function seedDatabaseIfEmpty() {
  try {
    const medCount = await Medicine.countDocuments();
    if (medCount === 0) {
      console.log('Seeding initial senior medicines...');
      const createdMeds = await Medicine.insertMany(sampleMedicines);

      // Create today's dose logs
      const todayStr = new Date().toISOString().split('T')[0];
      for (const med of createdMeds) {
        for (const time of med.alarmTimes) {
          await DoseLog.create({
            medicineId: med._id,
            medicineName: med.name,
            dosage: med.dosage,
            scheduledDate: todayStr,
            scheduledTime: time,
            status: 'pending',
          });
        }
      }

      // Create initial low stock alert
      await Alert.create({
        type: 'low_stock',
        title: '📦 दवाई खत्म होने वाली है (रीफिल अलर्ट)',
        message: 'शेल्कल 500 (Shelcal 500) की सिर्फ 4 गोलियां बची हैं! कृपया मेडिकल स्टोर से नई लाएं।',
        medicineName: 'Shelcal 500',
        severity: 'warning',
      });

      console.log('Sample medicines, doses, and alerts successfully seeded!');
    }

    // Ensure Profile exists
    const profileCount = await Profile.countDocuments();
    if (profileCount === 0) {
      await Profile.create({
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
      console.log('Default elder and caretaker profile initialized!');
    }

    // Ensure Default Users (Senior + Caretaker) exist
    const User = require('../models/User');
    const seniorUser = await User.findOne({ email: 'dadaji@ayushcare.com' });
    let createdSenior = seniorUser;
    if (!seniorUser) {
      createdSenior = await User.create({
        name: 'रामेश्वर दयाल (दादाजी)',
        email: 'dadaji@ayushcare.com',
        password: 'password123',
        role: 'patient',
        age: 72,
        phone: '+91 98110 54321',
        patientCode: 'ELD-7201',
        preferredLanguage: 'hi',
      });
      console.log('Default Senior User created (dadaji@ayushcare.com, Code: ELD-7201)');
    }

    const caretakerUser = await User.findOne({ email: 'caretaker@ayushcare.com' });
    if (!caretakerUser) {
      await User.create({
        name: 'अमित दयाल (केयरटेकर)',
        email: 'caretaker@ayushcare.com',
        password: 'password123',
        role: 'caretaker',
        age: 40,
        phone: '+91 98765 43210',
        linkedPatientCode: 'ELD-7201',
        linkedPatients: createdSenior ? [createdSenior._id] : [],
        preferredLanguage: 'hi',
      });
      console.log('Default Caretaker User created (caretaker@ayushcare.com, Linked: ELD-7201)');
    }
  } catch (err) {
    console.error('Error in seedDatabaseIfEmpty:', err.message);
  }
}

module.exports = { seedDatabaseIfEmpty };
