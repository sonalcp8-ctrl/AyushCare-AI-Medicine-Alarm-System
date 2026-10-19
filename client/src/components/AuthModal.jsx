import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, Lock, Mail, Phone, HeartPulse, Sparkles, Key, Users } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, handleLogin, handleRegister, handleDemoLogin, t, language } = useApp();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    phone: '',
    age: 72,
    linkedPatientCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
      const res = await handleRegister(formData);
      if (!res.success) {
        setError(res.error || 'Registration failed');
      }
    } else {
      const res = await handleLogin(formData.email, formData.password);
      if (!res.success) {
        setError(res.error || 'Login failed');
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-emerald-500 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                {isRegister ? t.submitRegister : t.login}
              </h2>
              <p className="text-xs text-slate-500 font-medium">{t.authSubtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 1-Click Quick Demo Login */}
        <div className="mb-6 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2 font-black text-xs text-emerald-800 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{t.quickDemoLoginTitle}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('patient')}
              className="w-full py-2.5 px-3 bg-white hover:bg-emerald-600 hover:text-white text-emerald-800 font-bold text-xs sm:text-sm rounded-xl border border-emerald-300 shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>👴</span>
              <span>{t.quickDemoSenior}</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('caretaker')}
              className="w-full py-2.5 px-3 bg-white hover:bg-indigo-600 hover:text-white text-indigo-800 font-bold text-xs sm:text-sm rounded-xl border border-indigo-300 shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>🩺</span>
              <span>{t.quickDemoCaretaker}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-300 text-rose-700 text-xs sm:text-sm font-semibold rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.roleLabel}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'patient' })}
                    className={`py-2 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 ${
                      formData.role === 'patient'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>👴</span>
                    <span>{language === 'hi' ? 'मरीज / दादाजी' : 'Senior Patient'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'caretaker' })}
                    className={`py-2 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 ${
                      formData.role === 'caretaker'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>🩺</span>
                    <span>{language === 'hi' ? 'केयरटेकर' : 'Caretaker'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.nameLabel}</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t.namePlaceholder}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  />
                </div>
              </div>

              {formData.role === 'caretaker' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.linkedCodeLabel}
                  </label>
                  <div className="relative">
                    <Key className="w-5 h-5 absolute left-3 top-2.5 text-indigo-500" />
                    <input
                      type="text"
                      value={formData.linkedPatientCode}
                      onChange={(e) => setFormData({ ...formData, linkedPatientCode: e.target.value })}
                      placeholder="ELD-7201"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-indigo-200 bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold uppercase tracking-wider text-indigo-900"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === 'hi'
                      ? 'दादाजी के स्क्रीन पर लिखा 6-अक्षरों का कोड भरें ताकि उनका अलार्म आपके फोन/लैपटॉप पर भी बजे'
                      : "Enter patient's code so missed alarms will sound on your device"}
                  </p>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.emailLabel}</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t.emailPlaceholder}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{t.passwordLabel}</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t.passwordPlaceholder}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-200 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? 'कृपया प्रतीक्षा करें...' : isRegister ? t.submitRegister : t.submitLogin}
          </button>
        </form>

        {/* Toggle Register / Login */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:underline"
          >
            {isRegister ? t.alreadyHaveAccount : t.dontHaveAccount}
          </button>
        </div>
      </div>
    </div>
  );
}
