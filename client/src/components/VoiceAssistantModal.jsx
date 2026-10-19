import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mic,
  MicOff,
  Volume2,
  X,
  Sparkles,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { createSpeechRecognizer, speakText, stopSpeaking } from '../services/speechService';
import { aiApi } from '../services/api';

const QUICK_QUESTIONS_HI = [
  'मेरी अगली दवाई कब है?',
  'क्या आज मैंने कोई दवाई मिस की?',
  'मुझे बीपी की गोली कब खानी है?',
  'शुगर की दवाई का समय क्या है?',
  'केयरटेकर का फोन नंबर क्या है?',
];

const QUICK_QUESTIONS_EN = [
  'What is my next medicine?',
  'Did I miss any medicine today?',
  'When should I take my BP medicine?',
  'What time is my Diabetes tablet?',
  'What is my Caretaker phone number?',
];

export default function VoiceAssistantModal() {
  const { isVoiceAssistantOpen, setIsVoiceAssistantOpen, profile, language, t } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isVoiceAssistantOpen) return null;

  const quickQuestions = language === 'hi' ? QUICK_QUESTIONS_HI : QUICK_QUESTIONS_EN;

  const handleStartListening = () => {
    stopSpeaking();
    setTranscript('');
    setResponse(null);

    const recognizer = createSpeechRecognizer(
      (text) => {
        setTranscript(text);
        handleSendVoiceQuery(text);
      },
      (err) => {
        console.warn(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
      language
    );

    if (recognizer) {
      try {
        recognizer.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Speech start error:', e);
      }
    } else {
      alert(
        language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस रिकॉग्निशन सपोर्ट नहीं है। कृपया नीचे दिए गए प्रश्नों पर क्लिक करें।'
          : 'Voice recognition is not supported in this browser. Please click any suggestion below.'
      );
    }
  };

  const handleSendVoiceQuery = async (queryText) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setTranscript(queryText);

    try {
      const res = await aiApi.voiceQuery(queryText);
      if (res.data.success) {
        setResponse(res.data.data);
        const speech =
          language === 'en'
            ? res.data.data.speechEnglish || res.data.data.speechHindi
            : res.data.data.speechHindi || res.data.data.speechEnglish;
        speakText(speech, { lang: language, rate: 0.88 });
      }
    } catch (e) {
      console.error(e);
      const fallback =
        language === 'hi'
          ? 'माफ कीजिए, मैं आपकी बात समझ नहीं पाया। कृपया दोबारा पूछें।'
          : 'Sorry, I could not understand. Please try again.';
      setResponse({ speechHindi: fallback, speechEnglish: fallback });
      speakText(fallback, { lang: language });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl border-4 border-indigo-400 relative text-center">
        {/* Close Button */}
        <button
          onClick={() => {
            stopSpeaking();
            setIsVoiceAssistantOpen(false);
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>{language === 'hi' ? 'आयुष AI वरिष्ठ साथी' : 'Ayush AI Senior Assistant'}</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900">
          {t.voiceAssistantTitle}
        </h2>
        <p className="text-slate-600 font-medium text-sm mt-1">
          {t.voiceAssistantSubtitle}
        </p>

        {/* Large Glowing Microphone Button */}
        <div className="my-8 flex justify-center">
          <button
            onClick={handleStartListening}
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse-fast ring-8 ring-rose-200'
                : 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white hover:shadow-indigo-300 hover:scale-105'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-10 h-10 animate-bounce" />
                <span className="text-xs font-extrabold mt-1">{t.voiceListening}</span>
              </>
            ) : (
              <>
                <Mic className="w-10 h-10" />
                <span className="text-xs font-extrabold mt-1">{t.voiceClickToSpeak}</span>
              </>
            )}
          </button>
        </div>

        {/* Display Spoken Query */}
        {transcript && (
          <div className="mb-4 bg-slate-100 p-3 rounded-2xl border border-slate-200 text-slate-800 font-bold text-base inline-block">
            " {transcript} "
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="text-indigo-600 font-bold animate-pulse text-base my-2">
            {language === 'hi' ? 'AI उत्तर तैयार कर रहा है...' : 'AI is thinking...'}
          </div>
        )}

        {/* Spoken AI Answer Box */}
        {response && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 mb-6 text-left shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-emerald-800">
                {language === 'hi' ? 'AI उत्तर:' : 'AI Answer:'}
              </span>
              <button
                onClick={() =>
                  speakText(language === 'en' ? response.speechEnglish || response.speechHindi : response.speechHindi || response.speechEnglish, {
                    lang: language,
                    rate: 0.88,
                  })
                }
                className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 text-xs font-bold cursor-pointer"
              >
                <Volume2 className="w-4 h-4" /> {language === 'hi' ? 'दोबारा सुनें' : 'Listen again'}
              </button>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {language === 'en' ? response.speechEnglish || response.speechHindi : response.speechHindi}
            </p>
            {language === 'hi' && response.speechEnglish && (
              <p className="text-xs text-slate-500 mt-2 font-medium">
                English: {response.speechEnglish}
              </p>
            )}
          </div>
        )}

        {/* Quick One-Tap Question Chips */}
        <div className="border-t border-slate-200 pt-4 text-left">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            {language === 'hi' ? 'या नीचे दिए गए किसी भी प्रश्न पर टैप करें:' : 'Or tap any quick query below:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendVoiceQuery(q)}
                className="bg-slate-100 hover:bg-indigo-100 hover:text-indigo-900 text-slate-700 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                👉 {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
