import React from 'react';
import { useApp } from '../context/AppContext';
import {
  HeartPulse,
  User,
  ShieldAlert,
  Mic,
  Volume2,
  Clock,
  LogIn,
  LogOut,
  Languages,
  Key,
} from 'lucide-react';
import { speakText } from '../services/speechService';
import { playChimeNote } from '../services/soundService';

export default function Navbar() {
  const {
    activeMode,
    setActiveMode,
    currentTime,
    unreadAlertCount,
    setIsVoiceAssistantOpen,
    handleTriggerSOS,
    profile,
    language,
    toggleLanguage,
    t,
    user,
    isAuthenticated,
    setIsAuthModalOpen,
    handleLogout,
  } = useApp();

  // Format time for seniors
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleTestAudio = () => {
    playChimeNote(600, 'sine', 0.3);
    speakText(
      language === 'hi'
        ? 'नमस्ते! आयुष केयर ध्वनि व अलार्म प्रणाली बिल्कुल सही काम कर रही है।'
        : 'Hello! AyushCare voice and alarm audio system is working properly.',
      { lang: language, rate: 0.9 }
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Patient Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 shrink-0">
            <HeartPulse className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900">
                {language === 'hi' ? 'आयुष' : 'Ayush'}{' '}
                <span className="text-emerald-600">{language === 'hi' ? 'केयर' : 'Care'}</span>
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                {t.aiPowered}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              {t.patientLabel}: {user?.role === 'patient' ? user.name : profile?.patientName || 'रामेश्वर दयाल (दादाजी)'}
              {user?.patientCode && (
                <span className="ml-2 font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {user.patientCode}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Live Senior Clock */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-300 shadow-inner">
          <Clock className="w-5 h-5 text-emerald-600 animate-pulse" />
          <div>
            <div className="font-black text-lg text-slate-800 tracking-wider font-mono">
              {formattedTime}
            </div>
            <div className="text-[11px] text-slate-500 font-medium capitalize">
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Actions & Role Switcher */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          {/* Language Switcher Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-2xl text-xs sm:text-sm font-extrabold shadow-sm transition active:scale-95"
            title="भाषा बदलें / Change Language"
          >
            <Languages className="w-4 h-4 text-amber-600" />
            <span>{language === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 English'}</span>
          </button>

          {/* Mode Switcher */}
          <div className="bg-slate-200 p-1 rounded-2xl flex items-center shadow-inner">
            <button
              onClick={() => setActiveMode('senior')}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                activeMode === 'senior'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t.seniorMode}</span>
            </button>
            <button
              onClick={() => setActiveMode('caretaker')}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                activeMode === 'caretaker'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t.caretakerMode}</span>
              {unreadAlertCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                  {unreadAlertCount}
                </span>
              )}
            </button>
          </div>

          {/* AI Voice Assistant Trigger */}
          <button
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="bg-violet-100 hover:bg-violet-200 text-violet-800 font-bold px-2.5 sm:px-3 py-2 rounded-2xl text-xs sm:text-sm flex items-center gap-1.5 border border-violet-300 transition-colors shadow-sm"
            title="AI से बोलकर पूछें"
          >
            <Mic className="w-4 h-4 text-violet-600" />
            <span className="hidden sm:inline">{t.aiSpeak}</span>
          </button>

          {/* Sound Test Button */}
          <button
            onClick={handleTestAudio}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 sm:p-2.5 rounded-2xl border border-slate-300 transition-colors"
            title={t.testSound}
          >
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
          </button>

          {/* Auth Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-2xl border border-slate-300">
              <span className="text-xs font-bold text-slate-700 hidden md:inline truncate max-w-[100px]">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="p-1 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-200 transition"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-2 rounded-2xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>{t.login}</span>
            </button>
          )}

          {/* Emergency SOS Button */}
          <button
            onClick={handleTriggerSOS}
            className="bg-rose-600 hover:bg-rose-700 text-white font-black px-2.5 sm:px-3.5 py-2 rounded-2xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-rose-300 animate-pulse active:scale-95 transition-all"
            title={t.emergencySOS}
          >
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
            <span className="hidden xs:inline">{t.emergencySOS}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
