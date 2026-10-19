import React from 'react';
import { useApp } from '../context/AppContext';
import PillVisualizer from './PillVisualizer';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Volume2,
  Mic,
  PhoneCall,
  Sparkles,
  Calendar,
  AlertTriangle,
  Play,
  Check,
} from 'lucide-react';
import { speakAlarmPrompt, speakMissedAlert } from '../services/speechService';

export default function SeniorDashboard() {
  const {
    todayData,
    profile,
    user,
    handleMarkTaken,
    handleMarkMissed,
    handleSnooze,
    triggerScheduledAlarm,
    triggerMissedAlarm,
    setIsVoiceAssistantOpen,
    language,
    t,
  } = useApp();

  const doses = todayData.doses || [];
  const stats = todayData.stats || { total: 0, taken: 0, missed: 0, pending: 0 };

  // Find next pending dose
  const nextPendingDose = doses.find((d) => d.status === 'pending' || d.status === 'snoozed');

  // Greeting by hour
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? t.goodMorning : currentHour < 17 ? t.goodAfternoon : t.goodEvening;

  const displayName = user?.name || profile?.patientName || (language === 'hi' ? 'दादाजी' : 'Senior');

  return (
    <div className="space-y-8 pb-16">
      {/* Elder-Friendly Welcome Greeting */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-emerald-100 text-sm font-bold px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{language === 'hi' ? 'वरिष्ठ नागरिक देखभाल केंद्र' : 'Senior Care & Wellness'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              {greeting}
            </h1>
            <p className="text-lg sm:text-xl font-medium text-emerald-100 mt-2">
              {t.greetingSubtitle}
            </p>
          </div>

          {/* Quick AI Voice Query Button */}
          <button
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="bg-white text-emerald-900 hover:bg-emerald-50 px-6 py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all cursor-pointer self-start md:self-center"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 animate-pulse">
              <Mic className="w-6 h-6" />
            </div>
            <span>{language === 'hi' ? 'मुझसे बोलकर पूछें 🎙️' : 'Ask with Voice 🎙️'}</span>
          </button>
        </div>

        {/* Adherence Mini Badge */}
        <div className="mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center gap-4 text-base font-bold">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            {t.takenDoses}: {stats.taken}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-amber-300" />
            {t.pendingDoses}: {stats.pending}
          </span>
          {stats.missed > 0 && (
            <span className="flex items-center gap-1.5 bg-rose-500/80 px-3 py-1 rounded-full text-white animate-pulse">
              <AlertTriangle className="w-5 h-5 text-yellow-300" />
              {t.missedDoses}: {stats.missed}
            </span>
          )}
        </div>
      </div>

      {/* Hero Section: Next Scheduled Medicine */}
      {nextPendingDose ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-emerald-500 shadow-2xl relative">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-white text-sm font-black px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                {t.nextMedicineDue}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2">
                <Clock className="w-7 h-7 text-emerald-600" />
                {t.timing}: {nextPendingDose.scheduledTime}
              </span>
            </div>

            {/* Test Alarm Sound Trigger */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerScheduledAlarm(nextPendingDose)}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
                title={t.testAlarm}
              >
                <Play className="w-4 h-4 fill-emerald-800" />
                <span>{language === 'hi' ? 'अलार्म बजाकर देखें' : 'Test Scheduled Alarm'}</span>
              </button>
              <button
                onClick={() => triggerMissedAlarm(nextPendingDose)}
                className="bg-rose-100 hover:bg-rose-200 text-rose-800 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
                title={t.testMissedAudioBtn}
              >
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{t.testMissedAudioBtn}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Pill graphic & info */}
            <div className="lg:col-span-2 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="p-4 bg-slate-100 rounded-3xl border-2 border-slate-200 shadow-inner flex items-center justify-center shrink-0">
                <PillVisualizer
                  shape={nextPendingDose.medicineId?.shape || 'Round'}
                  color={nextPendingDose.medicineId?.color || 'White'}
                  size="large"
                />
              </div>

              <div>
                <span className="text-sm font-extrabold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-md">
                  {nextPendingDose.medicineId?.category || 'Medicine'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                  {nextPendingDose.medicineName}
                </h2>
                <p className="text-xl font-bold text-slate-700 mt-1">
                  {t.dosage}: <span className="text-slate-900">{nextPendingDose.dosage}</span>
                </p>
                <p className="text-lg font-bold text-emerald-800 mt-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 inline-block">
                  👉 {nextPendingDose.medicineId?.instructions || (language === 'hi' ? 'पानी के साथ लें' : 'Take with water')}
                </p>
              </div>
            </div>

            {/* Big Action Buttons */}
            <div className="flex flex-col gap-3">
              {/* Taken Button */}
              <button
                onClick={() => handleMarkTaken(nextPendingDose._id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-2xl font-black text-xl sm:text-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-8 h-8" />
                <span>{t.takeMedicineBtn}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Snooze */}
                <button
                  onClick={() => handleSnooze(nextPendingDose._id, 10)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 py-3 px-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-1.5 border border-amber-300 transition-all cursor-pointer"
                >
                  <Clock className="w-5 h-5 text-amber-700" />
                  <span>{t.snoozeBtn}</span>
                </button>

                {/* Mark Missed */}
                <button
                  onClick={() => handleMarkMissed(nextPendingDose._id)}
                  className="bg-rose-100 hover:bg-rose-200 text-rose-800 py-3 px-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-1.5 border border-rose-300 transition-all cursor-pointer"
                >
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <span>{t.missedBtn}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border-4 border-emerald-500 rounded-3xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-emerald-900">
            {t.allDoneToday}
          </h2>
          <p className="text-lg font-medium text-emerald-800 mt-2">
            {language === 'hi'
              ? 'अब आप आराम करें। अगली खुराक कल सुबह निर्धारित समय पर होगी।'
              : 'Relax now. Your next doses will resume tomorrow as scheduled.'}
          </p>
        </div>
      )}

      {/* Missed Doses Banner (If any missed today) */}
      {stats.missed > 0 && (
        <div className="bg-rose-50 border-4 border-rose-500 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-rose-600 text-white p-3 rounded-2xl animate-bounce">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-rose-950">
                {t.urgentMissedBanner}
              </h2>
              <p className="text-rose-800 font-bold">
                {t.urgentMissedBannerSub}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doses
              .filter((d) => d.status === 'missed')
              .map((missedDose) => (
                <div
                  key={missedDose._id}
                  className="bg-white rounded-2xl p-4 border-2 border-rose-300 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <PillVisualizer
                      shape={missedDose.medicineId?.shape || 'Round'}
                      color={missedDose.medicineId?.color || 'White'}
                      size="normal"
                    />
                    <div>
                      <h4 className="text-xl font-black text-slate-900">{missedDose.medicineName}</h4>
                      <p className="text-sm font-bold text-rose-700">
                        {t.timing}: {missedDose.scheduledTime} ({t.statusMissed})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Speak aloud missed warning */}
                    <button
                      onClick={() => speakMissedAlert(missedDose.medicineName, missedDose.scheduledTime, language)}
                      className="p-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 cursor-pointer"
                      title={t.listenMissedAlertAgain}
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    {/* Take now anyway */}
                    <button
                      onClick={() => handleMarkTaken(missedDose._id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-sm font-bold cursor-pointer"
                    >
                      {language === 'hi' ? 'अभी ले ली' : 'Take Now'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* All Today's Doses List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-emerald-600" />
            <span>{t.upcomingDosesTitle}</span>
          </h2>
          <span className="text-sm font-bold text-slate-500">
            {t.totalMedicines}: {stats.total}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doses.map((dose) => {
            const isTaken = dose.status === 'taken';
            const isMissed = dose.status === 'missed';
            const isPending = dose.status === 'pending' || dose.status === 'snoozed';

            return (
              <div
                key={dose._id}
                className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between gap-4 ${
                  isTaken
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : isMissed
                    ? 'bg-rose-50/70 border-rose-300'
                    : 'bg-white border-slate-300 hover:border-emerald-400 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
                      <PillVisualizer
                        shape={dose.medicineId?.shape || 'Round'}
                        color={dose.medicineId?.color || 'White'}
                        size="normal"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black font-mono bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-300">
                          {dose.scheduledTime}
                        </span>
                        {isTaken && (
                          <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> {t.statusTaken}
                          </span>
                        )}
                        {isMissed && (
                          <span className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {t.statusMissed}
                          </span>
                        )}
                        {isPending && (
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-300">
                            {t.statusPending}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mt-1">
                        {dose.medicineName}
                      </h3>
                      <p className="text-sm font-bold text-slate-600">
                        {t.dosage}: {dose.dosage}
                      </p>
                      <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                        👉 {dose.medicineId?.instructions || (language === 'hi' ? 'पानी से लें' : 'Take with water')}
                      </p>
                    </div>
                  </div>

                  {/* Play Voice button */}
                  <button
                    onClick={() => {
                      if (isMissed) {
                        speakMissedAlert(dose.medicineName, dose.scheduledTime, language);
                      } else {
                        speakAlarmPrompt(
                          language === 'hi' ? dose.medicineId?.hindiVoicePrompt : '',
                          dose.medicineName,
                          dose.dosage,
                          language
                        );
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title={t.playVoicePromptBtn}
                  >
                    <Volume2 className="w-5 h-5 text-indigo-600" />
                  </button>
                </div>

                {/* Actions for this dose */}
                {isPending && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => handleMarkTaken(dose._id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.takeMedicineBtn}</span>
                    </button>
                    <button
                      onClick={() => triggerMissedAlarm(dose)}
                      className="bg-rose-100 hover:bg-rose-200 text-rose-800 py-2 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 border border-rose-300 cursor-pointer"
                      title={t.testMissedAudioBtn}
                    >
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>{language === 'hi' ? 'मिस टेस्ट' : 'Missed Test'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Caretaker Emergency Card for Senior */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
            {language === 'hi' ? 'आपका समर्पित केयरटेकर (सहयोगी)' : 'Your Dedicated Caretaker'}
          </span>
          <h3 className="text-2xl sm:text-3xl font-black mt-1">
            {profile?.caretakerName || 'अमित दयाल (बेटा)'}
          </h3>
          <p className="text-indigo-200 text-sm mt-1">
            {language === 'hi'
              ? 'किसी भी परेशानी या नई दवाई के लिए तुरंत संपर्क करें।'
              : 'Contact immediately for any help or medicine questions.'}
          </p>
        </div>

        <a
          href={`tel:${profile?.caretakerPhone || '+919876543210'}`}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xl px-8 py-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer"
        >
          <PhoneCall className="w-7 h-7 text-slate-950" />
          <span>
            {language === 'hi' ? 'केयरटेकर को कॉल करें' : 'Call Caretaker'} ({profile?.caretakerPhone || '+91 98765 43210'})
          </span>
        </a>
      </div>
    </div>
  );
}
