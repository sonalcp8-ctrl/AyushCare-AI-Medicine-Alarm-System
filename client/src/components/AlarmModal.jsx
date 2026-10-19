import React from 'react';
import { useApp } from '../context/AppContext';
import PillVisualizer from './PillVisualizer';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Volume2,
  XCircle,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { speakAlarmPrompt, speakMissedAlert } from '../services/speechService';

export default function AlarmModal() {
  const {
    activeAlarmDose,
    activeAlarmType,
    dismissAlarm,
    handleMarkTaken,
    handleMarkMissed,
    handleSnooze,
    profile,
    language,
    t,
  } = useApp();

  if (!activeAlarmDose) return null;

  const isMissed = activeAlarmType === 'missed';
  const medicine = activeAlarmDose.medicineId || {};
  const medName = activeAlarmDose.medicineName || medicine.name || (language === 'hi' ? 'दवाई' : 'Medicine');
  const dosage = activeAlarmDose.dosage || medicine.dosage || '1 Tablet';
  const instructions = medicine.instructions || (language === 'hi' ? 'पानी के साथ लें' : 'Take with water');

  const handleReplayVoice = () => {
    if (isMissed) {
      speakMissedAlert(medName, activeAlarmDose.scheduledTime, language);
    } else {
      speakAlarmPrompt(
        language === 'hi' ? medicine.hindiVoicePrompt : '',
        medName,
        dosage,
        language
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border-4 text-center transition-all ${
          isMissed
            ? 'bg-rose-50 border-rose-500 shadow-rose-400/50 alarm-pulsing'
            : 'bg-white border-emerald-500 shadow-emerald-400/50'
        }`}
      >
        {/* Header Icon & Title */}
        <div className="inline-flex p-4 rounded-3xl mb-4 shadow-inner">
          {isMissed ? (
            <div className="bg-rose-500 text-white p-4 rounded-2xl animate-bounce">
              <AlertTriangle className="w-14 h-14" />
            </div>
          ) : (
            <div className="bg-emerald-500 text-white p-4 rounded-2xl animate-pulse-fast">
              <Bell className="w-14 h-14" />
            </div>
          )}
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-black mb-2 text-slate-900 tracking-tight">
          {isMissed ? t.missedAlarmRingingTitle : t.alarmRingingTitle}
        </h2>

        <p className="text-xl sm:text-2xl font-bold text-slate-700 mb-6">
          {isMissed ? t.missedSubtitle : t.alarmSubtitle}
        </p>

        {/* Medicine Detail Card for Senior */}
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-300 shadow-md mb-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200">
              <PillVisualizer
                shape={medicine.shape || 'Round'}
                color={medicine.color || 'White'}
                size="large"
              />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                {medicine.category || 'Medicine'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {medName}
              </h3>
              <p className="text-lg font-bold text-slate-600">
                {t.dosage}: <span className="text-slate-900">{dosage}</span>
              </p>
              <p className="text-base font-semibold text-emerald-800 mt-1">
                👉 {instructions}
              </p>
            </div>
          </div>

          {/* Voice Prompt Playback */}
          <button
            onClick={handleReplayVoice}
            className="flex sm:flex-col items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-2xl border border-indigo-200 font-bold shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
            title="दोबारा बोलकर सुनाओ"
          >
            <Volume2 className="w-7 h-7 text-indigo-600 animate-pulse" />
            <span className="text-xs sm:text-sm">{t.playVoicePromptBtn}</span>
          </button>
        </div>

        {/* Action Buttons for Elderly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Taken Button */}
          <button
            onClick={() => handleMarkTaken(activeAlarmDose._id)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-5 px-6 rounded-2xl font-black text-xl sm:text-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-8 h-8" />
            <span>{t.takeMedicineBtn}</span>
          </button>

          {/* Snooze 10 Mins */}
          <button
            onClick={() => handleSnooze(activeAlarmDose._id, 10)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 py-5 px-6 rounded-2xl font-black text-xl sm:text-2xl flex items-center justify-center gap-3 shadow-xl shadow-amber-200 active:scale-95 transition-all cursor-pointer"
          >
            <Clock className="w-8 h-8" />
            <span>{t.snoozeBtn}</span>
          </button>
        </div>

        {/* Bottom Helpers */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 text-sm">
          {!isMissed && (
            <button
              onClick={() => handleMarkMissed(activeAlarmDose._id, language === 'hi' ? 'वरिष्ठ ने मिस मार्क किया' : 'Senior skipped dose')}
              className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-rose-100 transition-all cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
              <span>{t.missedBtn}</span>
            </button>
          )}

          <a
            href={`tel:${profile?.caretakerPhone || '+919876543210'}`}
            className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-indigo-100 transition-all cursor-pointer ml-auto"
          >
            <PhoneCall className="w-5 h-5" />
            <span>{language === 'hi' ? 'केयरटेकर को कॉल करें' : 'Call Caretaker'}</span>
          </a>

          <button
            onClick={dismissAlarm}
            className="text-slate-500 hover:text-slate-800 font-bold py-2 px-3 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
          >
            {t.dismissAlarmBtn} ✕
          </button>
        </div>
      </div>
    </div>
  );
}
