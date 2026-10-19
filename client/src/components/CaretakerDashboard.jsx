import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PillVisualizer from './PillVisualizer';
import {
  ShieldCheck,
  PlusCircle,
  AlertTriangle,
  Pill,
  Clock,
  PhoneCall,
  User,
  HeartPulse,
  Trash2,
  Edit,
  CheckCircle2,
  Volume2,
  VolumeX,
  Phone,
  Sparkles,
  Key,
  Link as LinkIcon,
} from 'lucide-react';
import { medicineApi, alertApi } from '../services/api';
import { speakCaretakerMissedAlert } from '../services/speechService';
import { playCaretakerAlertSound } from '../services/soundService';

export default function CaretakerDashboard() {
  const {
    todayData,
    medicines,
    refillAlerts,
    profile,
    user,
    alerts,
    unreadAlertCount,
    openAddMedicineModal,
    openEditMedicineModal,
    fetchMedicines,
    fetchTodayDoses,
    fetchAlerts,
    language,
    t,
    caretakerAudioEnabled,
    setCaretakerAudioEnabled,
    testCaretakerAudioAlert,
    handleLinkPatient,
  } = useApp();

  const [deletingId, setDeletingId] = useState(null);
  const [linkInput, setLinkInput] = useState('');
  const [linkStatus, setLinkStatus] = useState('');

  const stats = todayData.stats || { total: 0, taken: 0, missed: 0, pending: 0, adherenceRate: 100 };

  const handleDeleteMedicine = async (id, name) => {
    if (window.confirm(language === 'hi' ? `क्या आप "${name}" को हटाना चाहते हैं?` : `Delete "${name}"?`)) {
      setDeletingId(id);
      try {
        await medicineApi.delete(id);
        await fetchMedicines();
        await fetchTodayDoses();
      } catch (err) {
        console.error('Delete error:', err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleMarkAlertRead = async (id) => {
    try {
      await alertApi.markRead(id);
      await fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAllAlerts = async () => {
    try {
      await alertApi.clearAll();
      await fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlaySingleAlertAudio = (alert) => {
    playCaretakerAlertSound();
    speakCaretakerMissedAlert(
      alert.medicineName || (language === 'hi' ? 'दवाई' : 'Medicine'),
      alert.scheduledTime || '',
      profile?.patientName || (language === 'hi' ? 'दादाजी' : 'Patient'),
      language
    );
  };

  const submitLinkCode = async (e) => {
    e.preventDefault();
    if (!linkInput) return;
    const res = await handleLinkPatient(linkInput);
    if (res.success) {
      setLinkStatus(res.message);
      setLinkInput('');
    } else {
      setLinkStatus(res.error || 'Linking failed');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Caretaker Header Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30 mb-2">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span>{t.caretakerPanelTitle}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            {t.caretakerPanelTitle}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-1">
            {t.patientLabel}: <strong className="text-white">{user?.linkedPatients?.[0]?.name || profile?.patientName || 'रामेश्वर दयाल (दादाजी)'}</strong>
            {user?.linkedPatientCode && (
              <span className="ml-2 font-mono text-xs bg-indigo-900 border border-indigo-600 px-2 py-0.5 rounded-full text-indigo-200">
                {t.patientCode}: {user.linkedPatientCode}
              </span>
            )}
          </p>
        </div>

        {/* Add Medicine Action */}
        <button
          onClick={openAddMedicineModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-6 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer self-start md:self-center"
        >
          <PlusCircle className="w-6 h-6" />
          <span>{t.addNewMedicineBtn}</span>
        </button>
      </div>

      {/* Live Caretaker Audio Missed Alert Panel */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-6 shadow-xl border-2 border-indigo-500 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-700/60 flex items-center justify-center shrink-0 border border-indigo-400">
            {caretakerAudioEnabled ? (
              <Volume2 className="w-8 h-8 text-emerald-400 animate-pulse" />
            ) : (
              <VolumeX className="w-8 h-8 text-rose-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black">{t.liveAudioMonitor}</h3>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${caretakerAudioEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
                {caretakerAudioEnabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <p className="text-indigo-200 text-sm mt-0.5">
              {t.liveAudioActive}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setCaretakerAudioEnabled(!caretakerAudioEnabled)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition ${
              caretakerAudioEnabled
                ? 'bg-indigo-700 hover:bg-indigo-600 text-white border-indigo-400'
                : 'bg-slate-800 text-slate-300 border-slate-600'
            }`}
          >
            {caretakerAudioEnabled ? '🔊 Audio ON' : '🔇 Audio OFF'}
          </button>

          <button
            onClick={testCaretakerAudioAlert}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2 active:scale-95"
            title="केयरटेकर के पास आने वाले मिस अलर्ट का ऑडियो टेस्ट करें"
          >
            <Volume2 className="w-4 h-4" />
            <span>{t.testCaretakerAudioBtn}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Adherence Rate */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.adherenceRate}</span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 mt-2">
            {stats.adherenceRate}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.adherenceRate}%` }}
            />
          </div>
        </div>

        {/* Taken Count */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.takenDoses}</span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-2 flex items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <span>{stats.taken}</span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">{language === 'hi' ? 'आज का रिकॉर्ड' : "Today's record"}</span>
        </div>

        {/* Missed Count */}
        <div className="bg-white rounded-2xl p-5 border-2 border-rose-200 bg-rose-50/50 shadow-sm">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">{t.missedDoses}</span>
          <div className="text-3xl sm:text-4xl font-black text-rose-600 mt-2 flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-rose-500 animate-pulse" />
            <span>{stats.missed}</span>
          </div>
          <span className="text-xs text-rose-600 font-bold mt-2 block">
            {stats.missed > 0 ? (language === 'hi' ? 'केयरटेकर अलर्ट सक्रिय' : 'Alert Active') : (language === 'hi' ? 'कोई मिस नहीं' : 'None missed')}
          </span>
        </div>

        {/* Pending Count */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.pendingDoses}</span>
          <div className="text-3xl sm:text-4xl font-black text-amber-600 mt-2 flex items-center gap-2">
            <Clock className="w-8 h-8 text-amber-500" />
            <span>{stats.pending}</span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">{language === 'hi' ? 'दिन के शेष शेड्यूल' : 'Remaining doses'}</span>
        </div>

        {/* Refill Alerts */}
        <div className="bg-white rounded-2xl p-5 border-2 border-indigo-200 bg-indigo-50/50 shadow-sm col-span-2 lg:col-span-1">
          <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">{t.refillAlertsSection}</span>
          <div className="text-3xl sm:text-4xl font-black text-indigo-700 mt-2 flex items-center gap-2">
            <Pill className="w-8 h-8 text-indigo-500" />
            <span>{refillAlerts.length}</span>
          </div>
          <span className="text-xs text-indigo-600 font-semibold mt-2 block">
            {refillAlerts.length > 0 ? (language === 'hi' ? 'खरीदने की जरूरत' : 'Action required') : (language === 'hi' ? 'स्टॉक पर्याप्त है' : 'Stock adequate')}
          </span>
        </div>
      </div>

      {/* Critical Caretaker Alerts / Missed Doses Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-700">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {t.missedAlertsSection}
              </h2>
              <p className="text-slate-500 text-sm">
                {language === 'hi'
                  ? 'मरीज द्वारा मिस की गई दवाइयां और इमरजेंसी अलर्ट यहाँ रियल-टाइम दिखाई देते हैं।'
                  : 'Missed doses and emergency alerts appear here with instant audio announcements.'}
              </p>
            </div>
          </div>

          {alerts.length > 0 && (
            <button
              onClick={handleClearAllAlerts}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'सभी पढ़े हुए मार्क करें' : 'Mark all as read'}
            </button>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="text-slate-700 font-bold">{t.noMissedAlerts}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 6).map((alert) => (
              <div
                key={alert._id}
                className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  alert.severity === 'critical'
                    ? 'bg-rose-50 border-rose-300'
                    : 'bg-amber-50 border-amber-300'
                } ${alert.isRead ? 'opacity-70' : 'ring-2 ring-rose-400'}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      alert.severity === 'critical'
                        ? 'bg-rose-600 text-white animate-bounce'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base">{alert.title}</h4>
                    <p className="text-slate-700 text-sm font-medium mt-0.5">{alert.message}</p>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Play audio alert for caretaker */}
                  <button
                    onClick={() => handlePlaySingleAlertAudio(alert)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    title={t.playCaretakerAlert}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{t.playCaretakerAlert}</span>
                  </button>

                  <a
                    href={`tel:${profile?.emergencyPhone || '+919876543210'}`}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'मरीज को कॉल करें' : 'Call Patient'}</span>
                  </a>

                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkAlertRead(alert._id)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      {language === 'hi' ? 'सुलझाया' : 'Resolve'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Stock Medicine Refill Warning Box */}
      {refillAlerts.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-amber-950">
                {t.refillAlertsSection}
              </h3>
              <p className="text-amber-800 text-sm font-medium">
                {language === 'hi'
                  ? 'निम्नलिखित दवाइयों का स्टॉक न्यूनतम सीमा से कम है। कृपया जल्द मेडिकल स्टोर से लाएं:'
                  : 'The following medicines are below threshold stock. Please reorder soon:'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {refillAlerts.map((med) => (
              <div
                key={med._id}
                className="bg-white p-4 rounded-2xl border border-amber-300 shadow-sm flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-black text-slate-900">{med.name}</h4>
                  <p className="text-xs text-slate-500">{med.category}</p>
                  <p className="text-sm font-extrabold text-rose-600 mt-1">
                    {t.stockLeft}: {med.stockCount}
                  </p>
                </div>
                <PillVisualizer shape={med.shape} color={med.color} size="normal" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Prescription & Medicine Schedule Manager */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {t.allMedicinesInventory} ({medicines.length})
            </h2>
            <p className="text-slate-500 text-sm">
              {language === 'hi'
                ? 'यहाँ से आप बुजुर्गों की किसी भी दवाई का विवरण, अलार्म समय और स्टॉक अपडेट कर सकते हैं।'
                : 'Manage medicine details, alarm times, dosage instructions, and inventory stock.'}
            </p>
          </div>

          <button
            onClick={openAddMedicineModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t.addNewMedicineBtn}</span>
          </button>
        </div>

        {medicines.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-medium">
            {language === 'hi' ? 'कोई दवाई नहीं मिली। ऊपर दिए गए बटन से नई दवाई जोड़ें।' : 'No medicines added yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((med) => (
              <div
                key={med._id}
                className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Top Bar with Category & Color Visual */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-md border border-indigo-200">
                      {med.category}
                    </span>
                    <PillVisualizer shape={med.shape} color={med.color} size="normal" />
                  </div>

                  <h3 className="text-xl font-black text-slate-900">{med.name}</h3>
                  {med.genericName && (
                    <p className="text-xs text-slate-500 italic">{med.genericName}</p>
                  )}

                  <div className="mt-3 space-y-1.5 text-sm">
                    <p className="font-bold text-slate-700">
                      {t.dosage}: <span className="text-slate-900">{med.dosage}</span> ({med.form})
                    </p>
                    <p className="font-semibold text-emerald-800">
                      👉 {med.instructions}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-slate-600">{t.timing}:</span>
                      {med.alarmTimes.map((time, idx) => (
                        <span
                          key={idx}
                          className="bg-white px-2 py-0.5 rounded-md text-xs font-black border border-slate-300 font-mono"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stock count */}
                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">{t.stockLeft}:</span>
                    <span
                      className={`font-black px-2 py-0.5 rounded-md ${
                        med.stockCount <= med.refillThreshold
                          ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {med.stockCount} {language === 'hi' ? 'गोलियां' : 'pills'}
                    </span>
                  </div>

                  {/* Hindi Voice Script */}
                  {med.hindiVoicePrompt && (
                    <div className="mt-2 p-2 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 italic">
                      🗣️ "{med.hindiVoicePrompt}"
                    </div>
                  )}

                  {/* Side Effects / Caution */}
                  {med.sideEffectsWarning && (
                    <div className="mt-2 text-[11px] text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200">
                      ⚠️ {med.sideEffectsWarning}
                    </div>
                  )}
                </div>

                {/* Card footer actions: Edit & Delete */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {med.frequency}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditMedicineModal(med)}
                      className="text-indigo-600 hover:text-indigo-800 p-2 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
                      title={t.editMedicine}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedicine(med._id, med.name)}
                      disabled={deletingId === med._id}
                      className="text-rose-600 hover:text-rose-800 p-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                      title={t.deleteMedicine}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patient & Caretaker Profile Card + Code Linking */}
      <div className="bg-slate-100 rounded-3xl p-6 sm:p-8 border-2 border-slate-300">
        <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-600" />
          <span>{t.patientProfile}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-black text-slate-900 text-lg mb-2">{t.patientLabel}</h4>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li><strong>{language === 'hi' ? 'नाम:' : 'Name:'}</strong> {user?.linkedPatients?.[0]?.name || profile?.patientName || 'रामेश्वर दयाल (दादाजी)'}</li>
              <li><strong>{language === 'hi' ? 'उम्र:' : 'Age:'}</strong> {profile?.patientAge || 72} {t.yearsOld}</li>
              <li><strong>{language === 'hi' ? 'ब्लड ग्रुप:' : 'Blood Group:'}</strong> {profile?.bloodGroup || 'B+'}</li>
              <li>
                <strong>{t.chronicConditions}:</strong>{' '}
                {(profile?.chronicConditions || []).join(', ') || 'हाई बीपी, टाइप 2 डायबिटीज'}
              </li>
              <li>
                <strong>{t.allergies}:</strong> {(profile?.allergies || []).join(', ') || 'पेनिसिलिन'}
              </li>
              <li className="pt-2 border-t mt-2">
                <strong>{t.doctorContact}:</strong> {profile?.doctorContact?.name || 'Dr. S. K. Gupta'} ({profile?.doctorContact?.phone || '+91 98110 54321'})
              </li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-black text-slate-900 text-lg mb-2">{t.caretakerName}</h4>
              <ul className="space-y-1.5 text-sm text-slate-700">
                <li><strong>{language === 'hi' ? 'नाम:' : 'Name:'}</strong> {user?.name || profile?.caretakerName || 'अमित दयाल'}</li>
                <li><strong>{language === 'hi' ? 'रिश्ता:' : 'Relationship:'}</strong> {profile?.caretakerRelationship || 'बेटा (Son)'}</li>
                <li><strong>{language === 'hi' ? 'फोन नंबर:' : 'Phone:'}</strong> {user?.phone || profile?.caretakerPhone || '+91 98765 43210'}</li>
                <li><strong>{language === 'hi' ? 'ईमेल:' : 'Email:'}</strong> {user?.email || profile?.caretakerEmail || 'caretaker@example.com'}</li>
              </ul>
            </div>

            {/* Link Patient Code Box */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-600 mb-1">
                {language === 'hi' ? 'मरीज का यूनिक कोड लिंक करें (Link Patient Code):' : 'Link Patient by Unique Code:'}
              </label>
              <form onSubmit={submitLinkCode} className="flex gap-2">
                <input
                  type="text"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="ELD-7201"
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase w-full max-w-[160px]"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition"
                >
                  {language === 'hi' ? 'लिंक करें' : 'Link'}
                </button>
              </form>
              {linkStatus && (
                <p className="text-[11px] font-bold text-emerald-700 mt-1">{linkStatus}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
