import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import PillVisualizer from './PillVisualizer';
import {
  X,
  Sparkles,
  ShieldCheck,
  Clock,
  Plus,
  Trash2,
  FileText,
  AlertTriangle,
  Volume2,
} from 'lucide-react';
import { medicineApi, aiApi } from '../services/api';
import { speakText } from '../services/speechService';

const CATEGORIES = [
  'Blood Pressure',
  'Diabetes',
  'Heart & Cardiac',
  'Pain & Arthritis',
  'Thyroid',
  'Digestion & Acidity',
  'Vitamins & Calcium',
  'Eye / Ear Drops',
  'Respiratory / Asthma',
  'Other',
];

const FORMS = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Eye Drops', 'Inhaler'];
const COLORS = ['White', 'Blue', 'Red', 'Yellow', 'Green', 'Pink', 'Orange', 'Brown'];
const SHAPES = ['Round', 'Oval', 'Capsule', 'Oblong', 'Square', 'Liquid Bottle'];

const INSTRUCTIONS_HI = [
  'Before Food (खाली पेट)',
  'After Breakfast (नाश्ते के बाद)',
  'After Lunch (दोपहर के खाने के बाद)',
  'After Dinner (रात के खाने के बाद)',
  'With Warm Water (गुनगुने पानी से)',
  'Before Sleep (सोने से पहले)',
  'As Needed (जरूरत पड़ने पर / SOS)',
];

const FREQUENCIES = [
  'Once Daily',
  'Twice Daily',
  'Thrice Daily',
  'Every 8 Hours',
  'Every Alternate Day',
  'SOS / As Needed',
];

export default function MedicineFormModal() {
  const {
    isAddMedModalOpen,
    setIsAddMedModalOpen,
    editingMedicine,
    fetchMedicines,
    fetchTodayDoses,
    language,
    t,
  } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Blood Pressure',
    dosage: '1 Tablet',
    form: 'Tablet',
    color: 'Blue',
    shape: 'Round',
    instructions: 'After Breakfast (नाश्ते के बाद)',
    frequency: 'Once Daily',
    alarmTimes: ['09:00'],
    stockCount: 30,
    refillThreshold: 5,
    doctorName: '',
    sideEffectsWarning: '',
    hindiVoicePrompt: '',
    notes: '',
  });

  const [prescriptionInput, setPrescriptionInput] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync with editingMedicine when opened
  useEffect(() => {
    if (editingMedicine) {
      setFormData({
        name: editingMedicine.name || '',
        genericName: editingMedicine.genericName || '',
        category: editingMedicine.category || 'Blood Pressure',
        dosage: editingMedicine.dosage || '1 Tablet',
        form: editingMedicine.form || 'Tablet',
        color: editingMedicine.color || 'Blue',
        shape: editingMedicine.shape || 'Round',
        instructions: editingMedicine.instructions || 'After Breakfast (नाश्ते के बाद)',
        frequency: editingMedicine.frequency || 'Once Daily',
        alarmTimes: editingMedicine.alarmTimes || ['09:00'],
        stockCount: editingMedicine.stockCount ?? 30,
        refillThreshold: editingMedicine.refillThreshold ?? 5,
        doctorName: editingMedicine.doctorName || '',
        sideEffectsWarning: editingMedicine.sideEffectsWarning || '',
        hindiVoicePrompt: editingMedicine.hindiVoicePrompt || '',
        notes: editingMedicine.notes || '',
      });
    } else {
      setFormData({
        name: '',
        genericName: '',
        category: 'Blood Pressure',
        dosage: '1 Tablet',
        form: 'Tablet',
        color: 'Blue',
        shape: 'Round',
        instructions: 'After Breakfast (नाश्ते के बाद)',
        frequency: 'Once Daily',
        alarmTimes: ['09:00'],
        stockCount: 30,
        refillThreshold: 5,
        doctorName: '',
        sideEffectsWarning: '',
        hindiVoicePrompt: '',
        notes: '',
      });
    }
    setAiReport(null);
    setPrescriptionInput('');
  }, [editingMedicine, isAddMedModalOpen]);

  if (!isAddMedModalOpen) return null;

  // Add another alarm time
  const handleAddAlarmTime = () => {
    setFormData((prev) => ({
      ...prev,
      alarmTimes: [...prev.alarmTimes, '20:00'],
    }));
  };

  // Remove alarm time
  const handleRemoveAlarmTime = (index) => {
    if (formData.alarmTimes.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      alarmTimes: prev.alarmTimes.filter((_, i) => i !== index),
    }));
  };

  // Change specific alarm time
  const handleTimeChange = (index, value) => {
    const updated = [...formData.alarmTimes];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, alarmTimes: updated }));
  };

  // AI Parse Prescription
  const handleParsePrescription = async (textToParse) => {
    const raw = textToParse || prescriptionInput;
    if (!raw.trim()) return;

    setAiAnalyzing(true);
    try {
      const res = await aiApi.parsePrescription(raw);
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        setFormData((prev) => ({
          ...prev,
          name: d.name || prev.name,
          genericName: d.generic || prev.genericName,
          category: d.cat || prev.category,
          dosage: d.dose || prev.dosage,
          form: d.form || prev.form,
          color: d.color || prev.color,
          shape: d.shape || prev.shape,
          instructions: d.inst || prev.instructions,
          frequency: d.freq || prev.frequency,
          alarmTimes: d.times && d.times.length > 0 ? d.times : prev.alarmTimes,
          stockCount: d.stockCount || prev.stockCount,
        }));
      }
    } catch (e) {
      console.error('AI Parse error:', e);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // AI Drug Safety & Interaction Check
  const handleCheckSafety = async () => {
    if (!formData.name) {
      alert(language === 'hi' ? 'कृपया पहले दवाई का नाम दर्ज करें' : 'Please enter medicine name first');
      return;
    }
    setAiAnalyzing(true);
    try {
      const res = await aiApi.checkSafety({
        name: formData.name,
        category: formData.category,
        dosage: formData.dosage,
        instructions: formData.instructions,
      });

      if (res.data.success) {
        setAiReport(res.data.data);
        if (res.data.data.hindiVoicePrompt && !formData.hindiVoicePrompt) {
          setFormData((prev) => ({
            ...prev,
            hindiVoicePrompt: res.data.data.hindiVoicePrompt,
          }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Form Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert(language === 'hi' ? 'दवाई का नाम अनिवार्य है' : 'Medicine name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingMedicine) {
        await medicineApi.update(editingMedicine._id, formData);
      } else {
        await medicineApi.create(formData);
      }
      await fetchMedicines();
      await fetchTodayDoses();
      setIsAddMedModalOpen(false);
    } catch (err) {
      console.error('Error saving medicine:', err);
      alert('Error saving medicine: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl my-8 p-6 sm:p-8 shadow-2xl border-2 border-slate-300 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsAddMedModalOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{language === 'hi' ? 'AI असिस्टेड प्रेस्क्रिप्शन फॉर्म' : 'AI Assisted Prescription Form'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {editingMedicine ? t.editMedTitle : t.addMedTitle}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {language === 'hi'
              ? 'यहाँ मरीज की दवाई की पूरी जानकारी भरें। AI अपने आप बुजुर्गों के लिए हिंदी/इंग्लिश आवाज़ अलार्म तैयार करेगा।'
              : 'Fill comprehensive medicine details for senior-friendly visual and voice alarm management.'}
          </p>
        </div>

        {/* AI Smart Prescription Scanner Box */}
        <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 uppercase">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>{t.aiPrescriptionScanner}</span>
            </span>
          </div>

          <p className="text-xs text-indigo-700 mb-2">
            {t.aiScannerDesc}
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={prescriptionInput}
              onChange={(e) => setPrescriptionInput(e.target.value)}
              placeholder={t.pastePrescriptionPlaceholder}
              className="flex-1 px-4 py-2 bg-white rounded-xl border border-indigo-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleParsePrescription()}
              disabled={aiAnalyzing || !prescriptionInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{aiAnalyzing ? 'स्कैन हो रहा है...' : t.aiParseBtn}</span>
            </button>
          </div>
        </div>

        {/* The Main Medicine Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Name and Generic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.medNameLabel} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.medNamePlaceholder}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.genericNameLabel}
              </label>
              <input
                type="text"
                value={formData.genericName}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                placeholder={t.genericNamePlaceholder}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Category and Dosage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.categoryLabel}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.dosageLabel} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder={t.dosagePlaceholder}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Visual Recognition Box (Color & Shape for Elders) */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800">
                  {language === 'hi' ? '👀 गोली का रंग और आकार (कमजोर नजर वाले बुजुर्गों के लिए)' : '👀 Pill Visual Identifier (For Seniors with Weak Eyesight)'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {language === 'hi' ? 'बुजुर्ग बिना पढ़े गोली के रंग व आकार से सही डब्बा पहचान लेते हैं।' : 'Enables seniors to easily recognize pills by color and shape.'}
                </p>
              </div>
              <PillVisualizer shape={formData.shape} color={formData.color} size="large" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.formLabel}</label>
                <select
                  value={formData.form}
                  onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  {FORMS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.pillColorLabel}</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  {COLORS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.pillShapeLabel}</label>
                <select
                  value={formData.shape}
                  onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  {SHAPES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 3: Instructions & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.instructionsLabel}
              </label>
              <select
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {INSTRUCTIONS_HI.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.frequencyLabel}
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Multi-Alarm Times */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700">
                {t.alarmTimesLabel}
              </label>
              <button
                type="button"
                onClick={handleAddAlarmTime}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addAlarmTime}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {formData.alarmTimes.map((time, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300"
                >
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                    className="bg-transparent text-sm font-mono font-bold focus:outline-none"
                  />
                  {formData.alarmTimes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAlarmTime(idx)}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Row 5: Stock count & Refill Threshold */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.stockCountLabel}
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockCount}
                onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.refillThresholdLabel}
              </label>
              <input
                type="number"
                min="1"
                value={formData.refillThreshold}
                onChange={(e) => setFormData({ ...formData, refillThreshold: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 6: Doctor & Side Effects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.doctorNameLabel}
              </label>
              <input
                type="text"
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                placeholder="Dr. S. K. Gupta (MD)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.sideEffectsLabel}
              </label>
              <input
                type="text"
                value={formData.sideEffectsWarning}
                onChange={(e) => setFormData({ ...formData, sideEffectsWarning: e.target.value })}
                placeholder={t.sideEffectsPlaceholder}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Voice Prompt Script */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                {t.voicePromptLabel}
              </label>
              <button
                type="button"
                onClick={handleCheckSafety}
                disabled={aiAnalyzing}
                className="text-xs font-bold text-violet-700 hover:text-violet-900 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI द्वारा आवाज़ तैयार करें</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={formData.hindiVoicePrompt}
              onChange={(e) => setFormData({ ...formData, hindiVoicePrompt: e.target.value })}
              placeholder={t.voicePromptPlaceholder}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* AI Safety Report Box (If checked) */}
          {aiReport && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h4 className="font-extrabold text-sm text-emerald-950">
                  AI सुरक्षा स्कोर: {aiReport.safetyScore}%
                </h4>
              </div>
              <ul className="text-xs text-emerald-900 space-y-1">
                {aiReport.suggestions.map((s, idx) => (
                  <li key={idx}>• {s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddMedModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-200 active:scale-95 transition-all cursor-pointer"
            >
              {submitting ? 'सुरक्षित हो रहा है...' : t.saveMedicineBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
