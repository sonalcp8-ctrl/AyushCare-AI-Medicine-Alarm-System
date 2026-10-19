/**
 * AI Helper Engine for Senior Medicine Management
 * Provides drug interaction checking, senior safety analysis,
 * Hindi voice prompt generation, prescription parsing, and conversational senior Q&A.
 */

const KNOWN_INTERACTIONS = [
  {
    pair: ['aspirin', 'ibuprofen'],
    warning: 'Severe: Dono NSAID painkillers hain. Pet me ulcer aur bleeding ka risk badhta hai.',
    severity: 'critical',
  },
  {
    pair: ['metformin', 'alcohol'],
    warning: 'High Risk: Metformin ke sath alcohol lene se Lactic Acidosis ka khatra hota hai.',
    severity: 'critical',
  },
  {
    pair: ['amlodipine', 'atenolol'],
    warning: 'Moderate: Dono BP kam karte hain. Blood pressure zyada gir sakta hai aur chakkar aa sakte hain.',
    severity: 'warning',
  },
  {
    pair: ['warfarin', 'aspirin'],
    warning: 'Extreme: Dono blood thinner hain. Internal bleeding ka bahut bada risk hai.',
    severity: 'critical',
  },
];

const SENIOR_TIPS = {
  'Blood Pressure': {
    advice: 'दवाई लेने के बाद अचानक बिस्तर से न उठें। 2 मिनट बैठें फिर खड़े हों ताकि चक्कर न आए।',
    time: 'सुबह नाश्ते के बाद',
    caution: 'नमक का सेवन कम करें और समय पर बीपी चेक करें।',
  },
  'Diabetes': {
    advice: 'दवाई हमेशा समय पर लें। पास में हमेशा 2 टॉफी या मीठा रखें अगर अचानक कमजोरी या पसीना आए।',
    time: 'सुबह और रात खाने के 15 मिनट पहले या बाद',
    caution: 'खाली पेट ज्यादा देर न रहें।',
  },
  'Heart & Cardiac': {
    advice: 'यह दिल की सुरक्षा के लिए बहुत जरूरी है। एक भी खुराक न छोड़ें।',
    time: 'डॉक्टर द्वारा बताए गए फिक्स समय पर',
    caution: 'भारी वजन न उठाएं और नियमित जांच करवाएं।',
  },
  'Pain & Arthritis': {
    advice: 'दर्द की दवा हमेशा भरे पेट (नाश्ते या खाने के बाद) ही लें, खाली पेट कभी न लें।',
    time: 'भोजन के बाद',
    caution: 'बिना डॉक्टर की सलाह के लगातार कई दिनों तक न लें।',
  },
  'Thyroid': {
    advice: 'सुबह उठते ही सबसे पहले खाली पेट गुनगुने पानी के साथ लें। 45 मिनट तक चाय या नाश्ता न करें।',
    time: 'सुबह 6:30 - 7:00 बजे खाली पेट',
    caution: 'कैल्शियम या आयरन की गोली इसके कम से कम 4 घंटे बाद लें।',
  },
  'Digestion & Acidity': {
    advice: 'सुबह नाश्ते से 30 मिनट पहले खाली पेट लें।',
    time: 'सुबह खाली पेट',
    caution: 'तला-भुना और ज्यादा तीखा खाना कम खाएं।',
  },
};

/**
 * Check drug safety & senior warnings
 */
function analyzeMedicineSafety(newMedicine, currentMedicines = []) {
  const warnings = [];
  const suggestions = [];

  const newMedLower = (newMedicine.name || '').toLowerCase();
  const category = newMedicine.category || 'Other';

  // Check known pair interactions
  for (const item of KNOWN_INTERACTIONS) {
    const hasFirst = newMedLower.includes(item.pair[0]) || currentMedicines.some((m) => (m.name || '').toLowerCase().includes(item.pair[0]));
    const hasSecond = newMedLower.includes(item.pair[1]) || currentMedicines.some((m) => (m.name || '').toLowerCase().includes(item.pair[1]));

    if (hasFirst && hasSecond) {
      warnings.push({
        severity: item.severity,
        message: item.warning,
      });
    }
  }

  // Senior specific category advice
  const catAdvice = SENIOR_TIPS[category];
  if (catAdvice) {
    suggestions.push(catAdvice.advice);
    suggestions.push(`बेस्ट समय: ${catAdvice.time}`);
    suggestions.push(`बुजुर्गों के लिए सावधानी: ${catAdvice.caution}`);
  } else {
    suggestions.push('दवाई हमेशा पर्याप्त पानी के साथ लें। किसी भी तरह की बेचैनी होने पर केयरटेकर को बताएं।');
  }

  // Hindi Voice prompt generation
  const hindiPrompt = generateHindiVoicePrompt(newMedicine);

  return {
    safetyScore: warnings.length === 0 ? 98 : warnings.some((w) => w.severity === 'critical') ? 45 : 75,
    warnings,
    seniorAdvice: suggestions,
    hindiVoicePrompt: hindiPrompt,
  };
}

/**
 * Generate natural Hindi voice text for elderly alarm
 */
function generateHindiVoicePrompt(med) {
  const name = med.name || 'दवाई';
  const dosage = med.dosage || '1 गोली';
  const instructions = med.instructions || 'पानी के साथ';

  return `नमस्ते दादाजी! यह आपकी ${name} लेने का समय है। खुराक है ${dosage}, कृपया ${instructions} लें।`;
}

/**
 * Generate Hindi voice alert when medicine is missed
 */
function generateMissedMedicineAlert(medName, scheduledTime) {
  return {
    hindiVoice: `ध्यान दीजिए! आपने अपनी दवाई ${medName} जो ${scheduledTime} बजे लेनी थी, मिस कर दी है! कृपया अभी दवाई लें या अपने केयरटेकर को सूचित करें।`,
    englishVoice: `Attention! You have missed your medicine ${medName} scheduled at ${scheduledTime}. Please take it now or inform your caretaker.`,
    caretakerHindiVoice: `केयरटेकर अलर्ट: मरीज ने ${scheduledTime} बजे की दवाई ${medName} मिस कर दी है! कृपया तुरंत ध्यान दें।`,
    caretakerEnglishVoice: `Caretaker Alert: Patient has missed their ${scheduledTime} dose of ${medName}! Please check immediately.`,
  };
}

/**
 * AI Prescription Text Parser (extracts medicine info from doctor notes)
 */
function parsePrescriptionText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { error: 'No prescription text provided' };
  }

  const text = rawText.toLowerCase();
  const detected = [];

  // Common senior medicines dictionary for instant intelligent match
  const drugDatabase = [
    { name: 'Metformin 500mg', generic: 'Metformin', cat: 'Diabetes', form: 'Tablet', color: 'White', shape: 'Oblong', dose: '1 Tablet', times: ['08:30', '20:30'], inst: 'After Breakfast (नाश्ते के बाद)', freq: 'Twice Daily' },
    { name: 'Amlodipine 5mg', generic: 'Amlodipine', cat: 'Blood Pressure', form: 'Tablet', color: 'Blue', shape: 'Round', dose: '1 Tablet', times: ['09:00'], inst: 'After Breakfast (नाश्ते के बाद)', freq: 'Once Daily' },
    { name: 'Telmisartan 40mg', generic: 'Telmisartan', cat: 'Blood Pressure', form: 'Tablet', color: 'White', shape: 'Oval', dose: '1 Tablet', times: ['08:30'], inst: 'After Breakfast (नाश्ते के बाद)', freq: 'Once Daily' },
    { name: 'Atorvastatin 10mg', generic: 'Atorvastatin', cat: 'Heart & Cardiac', form: 'Tablet', color: 'Yellow', shape: 'Round', dose: '1 Tablet', times: ['21:30'], inst: 'Before Sleep (सोने से पहले)', freq: 'Once Daily' },
    { name: 'Thyronorm 50mcg', generic: 'Levothyroxine', cat: 'Thyroid', form: 'Tablet', color: 'Pink', shape: 'Round', dose: '1 Tablet', times: ['06:30'], inst: 'Before Food (खाली पेट)', freq: 'Once Daily' },
    { name: 'Pantocid 40mg', generic: 'Pantoprazole', cat: 'Digestion & Acidity', form: 'Tablet', color: 'Yellow', shape: 'Oval', dose: '1 Tablet', times: ['07:30'], inst: 'Before Food (खाली पेट)', freq: 'Once Daily' },
    { name: 'Shelcal 500', generic: 'Calcium + Vit D3', cat: 'Vitamins & Calcium', form: 'Tablet', color: 'White', shape: 'Oval', dose: '1 Tablet', times: ['14:00'], inst: 'After Lunch (दोपहर के खाने के बाद)', freq: 'Once Daily' },
    { name: 'Paracetamol 650', generic: 'Acetaminophen', cat: 'Pain & Arthritis', form: 'Tablet', color: 'White', shape: 'Round', dose: '1 Tablet', times: ['14:00', '21:00'], inst: 'After Lunch (दोपहर के खाने के बाद)', freq: 'As Needed (जरूरत पड़ने पर / SOS)' },
  ];

  for (const drug of drugDatabase) {
    if (text.includes(drug.generic.toLowerCase()) || text.includes(drug.name.toLowerCase().split(' ')[0])) {
      detected.push(drug);
    }
  }

  // If none matched, construct a smart structured guess
  if (detected.length === 0) {
    return {
      name: rawText.slice(0, 30).trim(),
      category: text.includes('sugar') || text.includes('diabet') ? 'Diabetes' : text.includes('bp') || text.includes('press') ? 'Blood Pressure' : 'Other',
      dosage: '1 Tablet',
      form: 'Tablet',
      color: 'White',
      shape: 'Round',
      frequency: text.includes('twice') || text.includes('bd') ? 'Twice Daily' : 'Once Daily',
      alarmTimes: text.includes('twice') || text.includes('bd') ? ['08:30', '20:30'] : ['09:00'],
      instructions: 'After Breakfast (नाश्ते के बाद)',
      stockCount: 30,
    };
  }

  return detected[0];
}

/**
 * AI Voice Assistant Query Engine
 */
function answerElderVoiceQuery(query, activeMedicines = [], doseLogsToday = []) {
  const q = (query || '').toLowerCase();

  if (q.includes('agli') || q.includes('next') || q.includes('kab') || q.includes('kya lena')) {
    const now = new Date();
    const currentH = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    // find next scheduled dose
    const upcoming = [];
    for (const med of activeMedicines) {
      for (const t of med.alarmTimes || []) {
        if (t >= currentH) {
          upcoming.push({ time: t, med });
        }
      }
    }
    upcoming.sort((a, b) => a.time.localeCompare(b.time));

    if (upcoming.length > 0) {
      const next = upcoming[0];
      return {
        speechHindi: `आपकी अगली दवाई ${next.med.name} है, जिसका समय ${next.time} बजे है। इसे ${next.med.instructions} लेना है।`,
        speechEnglish: `Your next medicine is ${next.med.name} scheduled at ${next.time}. Take it ${next.med.instructions}.`,
        medicine: next.med,
      };
    } else {
      return {
        speechHindi: 'आज की सभी निर्धारित दवाइयों का समय पूरा हो चुका है! बहुत बढ़िया दादाजी।',
        speechEnglish: 'All scheduled medicines for today have been taken or completed! Great job.',
      };
    }
  }

  if (q.includes('miss') || q.includes('chhut') || q.includes('bhool')) {
    const missed = doseLogsToday.filter((l) => l.status === 'missed');
    if (missed.length > 0) {
      const names = missed.map((m) => m.medicineName).join(', ');
      return {
        speechHindi: `आपने आज ${names} मिस कर दी है! कृपया अभी ले लें या अपने केयरटेकर को फोन करें।`,
        speechEnglish: `You missed ${names} today. Please take it now or contact your caretaker.`,
      };
    } else {
      return {
        speechHindi: 'बधाई हो दादाजी! आज आपने एक भी दवाई मिस नहीं की है। सब कुछ सही है।',
        speechEnglish: 'Good news! You have not missed any medicine today.',
      };
    }
  }

  if (q.includes('bp') || q.includes('pressure') || q.includes('blood pressure')) {
    const bpMeds = activeMedicines.filter((m) => m.category === 'Blood Pressure');
    if (bpMeds.length > 0) {
      const med = bpMeds[0];
      return {
        speechHindi: `आपकी बीपी की दवाई ${med.name} है। इसका समय ${med.alarmTimes.join(' और ')} बजे है। इसे ${med.instructions} लें।`,
        speechEnglish: `Your blood pressure medicine is ${med.name} at ${med.alarmTimes.join(', ')}.`,
      };
    }
  }

  if (q.includes('sugar') || q.includes('diabetes')) {
    const sugarMeds = activeMedicines.filter((m) => m.category === 'Diabetes');
    if (sugarMeds.length > 0) {
      const med = sugarMeds[0];
      return {
        speechHindi: `आपकी शुगर की दवाई ${med.name} है। इसका समय ${med.alarmTimes.join(' और ')} बजे है।`,
        speechEnglish: `Your diabetes medicine is ${med.name} at ${med.alarmTimes.join(', ')}.`,
      };
    }
  }

  // Default response
  return {
    speechHindi: 'नमस्ते दादाजी! मैं आपका एआई दवाई साथी हूँ। आप मुझसे पूछ सकते हैं: मेरी अगली दवाई कब है, या मुझे कौन सी गोली खानी है।',
    speechEnglish: 'Hello! I am your AI Medicine Assistant. You can ask me about your next medicine or schedule.',
  };
}

module.exports = {
  analyzeMedicineSafety,
  generateHindiVoicePrompt,
  generateMissedMedicineAlert,
  parsePrescriptionText,
  answerElderVoiceQuery,
};
