import React from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import SeniorDashboard from './components/SeniorDashboard';
import CaretakerDashboard from './components/CaretakerDashboard';
import AlarmModal from './components/AlarmModal';
import MedicineFormModal from './components/MedicineFormModal';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import SOSModal from './components/SOSModal';
import AuthModal from './components/AuthModal';
import { HeartPulse, ShieldCheck, Phone } from 'lucide-react';

export default function App() {
  const { activeMode, loading, language } = useApp();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xl font-bold text-slate-700 animate-pulse">
              {language === 'hi' ? 'दवाइयों का डेटा और AI मॉडल लोड हो रहा है...' : 'Loading medicine schedules & AI engine...'}
            </p>
          </div>
        ) : activeMode === 'senior' ? (
          <SeniorDashboard />
        ) : (
          <CaretakerDashboard />
        )}
      </main>

      {/* Modals */}
      <AlarmModal />
      <MedicineFormModal />
      <VoiceAssistantModal />
      <SOSModal />
      <AuthModal />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t-2 border-slate-800 text-xs sm:text-sm text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <HeartPulse className="w-5 h-5 text-emerald-500" />
            <span>आयुष केयर (AyushCare) • MERN AI Medicine Alarm System</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span>बुजुर्ग हेल्पलाइन: 14567</span>
            <span>•</span>
            <span>इमरजेंसी एम्बुलेंस: 108</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">आवाज़ अलार्म चालू है</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
