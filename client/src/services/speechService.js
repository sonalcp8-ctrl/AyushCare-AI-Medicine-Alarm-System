/**
 * Web Speech API Engine for Senior Voice Alerts & Speech Recognition
 * Fully supports both Hindi (hi-IN) and English (en-US / en-IN)
 */

let synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let currentUtterance = null;

// Get available voices
export function getAvailableVoices() {
  if (!synth) return [];
  return synth.getVoices();
}

/**
 * Speak any text aloud in Hindi or English
 */
export function speakText(text, options = {}) {
  if (!synth || !text) return;

  // Cancel any ongoing speech
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  const lang = options.lang || 'hi'; // 'hi' or 'en'

  // Pick suitable voice
  if (lang === 'hi' || lang === 'hi-IN') {
    const hindiVoice =
      voices.find((v) => v.lang === 'hi-IN') ||
      voices.find((v) => v.lang.includes('hi')) ||
      voices.find((v) => v.lang.includes('en-IN')) ||
      voices[0];
    if (hindiVoice) utterance.voice = hindiVoice;
    utterance.lang = 'hi-IN';
  } else {
    const englishVoice =
      voices.find((v) => v.lang === 'en-IN') ||
      voices.find((v) => v.lang === 'en-US') ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];
    if (englishVoice) utterance.voice = englishVoice;
    utterance.lang = 'en-US';
  }

  // Senior settings: slower rate, clear volume
  utterance.rate = options.rate || (lang === 'hi' ? 0.88 : 0.92);
  utterance.pitch = options.pitch || 1.0;
  utterance.volume = options.volume || 1.0;

  currentUtterance = utterance;

  utterance.onend = () => {
    currentUtterance = null;
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis error:', e);
    currentUtterance = null;
    if (options.onError) options.onError(e);
  };

  synth.speak(utterance);
}

/**
 * Stop any speaking voice
 */
export function stopSpeaking() {
  if (synth) {
    synth.cancel();
  }
}

/**
 * Patient Missed Dose Voice Alert (Hindi & English)
 */
export function speakMissedAlert(medicineName, scheduledTime = '', lang = 'hi') {
  if (lang === 'en') {
    const enMsg = `Attention please! You have missed your medicine ${medicineName}${
      scheduledTime ? ' scheduled at ' + scheduledTime : ''
    }! Please take it now or inform your caretaker.`;
    speakText(enMsg, { lang: 'en', rate: 0.9 });
  } else {
    const hiMsg = `ध्यान दीजिए! आपने अपनी दवाई ${medicineName}${
      scheduledTime ? ' जो ' + scheduledTime + ' बजे लेनी थी,' : ''
    } मिस कर दी है! कृपया इसे अभी लें या अपने केयरटेकर को बताएं।`;
    speakText(hiMsg, { lang: 'hi', rate: 0.85 });
  }
}

/**
 * Caretaker Missed Dose Voice Announcement (Hindi & English)
 */
export function speakCaretakerMissedAlert(medicineName, scheduledTime = '', patientName = 'मरीज', lang = 'hi') {
  if (lang === 'en') {
    const enMsg = `Caretaker Alert! Patient ${patientName} has missed their ${
      scheduledTime ? scheduledTime + ' ' : ''
    }dose of ${medicineName}! Please check on them immediately.`;
    speakText(enMsg, { lang: 'en', rate: 0.9 });
  } else {
    const hiMsg = `केयरटेकर अलर्ट! ${patientName} ने ${
      scheduledTime ? scheduledTime + ' बजे की ' : ''
    }दवाई ${medicineName} मिस कर दी है! कृपया तुरंत ध्यान दें।`;
    speakText(hiMsg, { lang: 'hi', rate: 0.88 });
  }
}

/**
 * Scheduled Alarm Voice Announcement (Hindi & English)
 */
export function speakAlarmPrompt(promptText, medicineName = '', dosage = '1 Tablet', lang = 'hi') {
  if (lang === 'en') {
    const msg = promptText || `Hello! It is time to take your medicine ${medicineName}. The dosage is ${dosage}. Please take it with water.`;
    speakText(msg, { lang: 'en', rate: 0.9 });
  } else {
    const msg = promptText || `नमस्ते दादाजी! यह आपकी दवाई ${medicineName} लेने का समय है। खुराक है ${dosage}। कृपया पानी के साथ लें।`;
    speakText(msg, { lang: 'hi', rate: 0.88 });
  }
}

/**
 * Praise message when medicine is taken
 */
export function speakPraise(lang = 'hi') {
  if (lang === 'en') {
    speakText('Great job! You took your medicine on time. Stay healthy and blessed!', { lang: 'en', rate: 0.9 });
  } else {
    speakText('शाबाश दादाजी! आपने दवाई समय पर ले ली। स्वस्थ रहें और दीर्घायु हों!', { lang: 'hi', rate: 0.88 });
  }
}

/**
 * Speech Recognition for Elderly Voice Queries
 */
export function createSpeechRecognizer(onResult, onError, onEnd, lang = 'hi') {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = lang === 'en' ? 'en-US' : 'hi-IN';

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
