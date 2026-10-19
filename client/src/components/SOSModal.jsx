import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, PhoneCall, X, HeartHandshake } from 'lucide-react';

export default function SOSModal() {
  const { isSOSActive, handleDismissSOS, profile, language, t } = useApp();

  if (!isSOSActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border-4 border-rose-600 text-center alarm-pulsing">
        <div className="w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto mb-4 animate-bounce">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-rose-600 mb-2">
          {t.sosTitle}
        </h2>

        <p className="text-lg font-bold text-slate-800 mb-4">
          {t.sosSubtitle} ({profile?.caretakerName || 'अमित'})
        </p>

        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 mb-6 text-left">
          <div className="flex items-center gap-2 font-black text-rose-900 mb-1">
            <HeartHandshake className="w-5 h-5 text-rose-600" />
            <span>{language === 'hi' ? 'केयरटेकर सहायता फोन:' : 'Caretaker Contact:'}</span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {profile?.caretakerPhone || '+91 98765 43210'}
          </div>
          <p className="text-xs text-rose-700 mt-1 font-semibold">
            {language === 'hi' ? 'कॉल करने के लिए नीचे दिए गए बटन पर टैप करें।' : 'Tap below to place call directly.'}
          </p>
        </div>

        <div className="space-y-3">
          <a
            href={`tel:${profile?.caretakerPhone || '+919876543210'}`}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 active:scale-95 transition-all"
          >
            <PhoneCall className="w-7 h-7" />
            <span>{language === 'hi' ? 'केयरटेकर को तुरंत कॉल करें' : 'Call Caretaker Now'}</span>
          </a>

          <button
            onClick={handleDismissSOS}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-2xl font-bold text-base cursor-pointer"
          >
            {t.sosStopAlert}
          </button>
        </div>
      </div>
    </div>
  );
}
