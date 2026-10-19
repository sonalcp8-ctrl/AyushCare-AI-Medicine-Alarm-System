import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { medicineApi, doseApi, profileApi, alertApi, authApi } from '../services/api';
import {
  startMedicineAlarmSound,
  playMissedDoseSound,
  playCaretakerAlertSound,
  playTakenSuccessSound,
  startSirenSound,
  stopAlarmSound,
  playChimeNote,
} from '../services/soundService';
import {
  speakAlarmPrompt,
  speakMissedAlert,
  speakCaretakerMissedAlert,
  speakPraise,
  speakText,
  stopSpeaking,
} from '../services/speechService';
import { translations } from '../translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Language: 'hi' (Hindi) or 'en' (English)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('ayushcare_lang') || 'hi';
  });

  const t = translations[language] || translations.hi;

  const toggleLanguage = () => {
    const nextLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(nextLang);
    localStorage.setItem('ayushcare_lang', nextLang);
    speakText(nextLang === 'hi' ? 'भाषा बदलकर हिंदी कर दी गई है।' : 'Language switched to English.', { lang: nextLang });
  };

  // Auth state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ayushcare_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('ayushcare_token') || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active Mode: 'senior' for elderly patient, 'caretaker' for family/nurse
  const [activeMode, setActiveMode] = useState(() => {
    return user?.role === 'caretaker' ? 'caretaker' : 'senior';
  });

  // Caretaker audio monitor switch (default ON so caretaker hears missed doses)
  const [caretakerAudioEnabled, setCaretakerAudioEnabled] = useState(true);

  // Data states
  const [todayData, setTodayData] = useState({
    date: '',
    stats: { total: 0, taken: 0, missed: 0, pending: 0, adherenceRate: 100 },
    doses: [],
  });
  const [medicines, setMedicines] = useState([]);
  const [refillAlerts, setRefillAlerts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);

  // Modals & Active Alarm state
  const [activeAlarmDose, setActiveAlarmDose] = useState(null);
  const [activeAlarmType, setActiveAlarmType] = useState('alarm'); // 'alarm' or 'missed'
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Live digital clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Prevent duplicate auto-alerts in the same session
  const triggeredAlarmsRef = useRef(new Set());
  const triggeredMissedRef = useRef(new Set());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today doses
  const fetchTodayDoses = useCallback(async () => {
    try {
      const res = await doseApi.getToday();
      if (res.data.success) {
        setTodayData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching today doses:', err);
    }
  }, []);

  // Fetch medicines
  const fetchMedicines = useCallback(async () => {
    try {
      const res = await medicineApi.getAll();
      if (res.data.success) {
        setMedicines(res.data.data);
      }
      const refRes = await medicineApi.getRefills();
      if (refRes.data.success) {
        setRefillAlerts(refRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await alertApi.getAll();
      if (res.data.success) {
        setAlerts(res.data.data);
        setUnreadAlertCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  }, []);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      const res = await profileApi.getProfile();
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchTodayDoses(), fetchMedicines(), fetchAlerts(), fetchProfile()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchTodayDoses, fetchMedicines, fetchAlerts, fetchProfile]);

  // Trigger Scheduled Alarm Modal + Audio + Voice
  const triggerScheduledAlarm = useCallback(
    (dose) => {
      setActiveAlarmDose(dose);
      setActiveAlarmType('alarm');
      startMedicineAlarmSound();

      const customVoice = language === 'hi' ? dose.medicineId?.hindiVoicePrompt : '';
      speakAlarmPrompt(customVoice, dose.medicineName, dose.dosage, language);
    },
    [language]
  );

  // Trigger Missed Alarm Modal + Audio + Voice (For Senior & Caretaker)
  const triggerMissedAlarm = useCallback(
    (dose) => {
      setActiveAlarmDose(dose);
      setActiveAlarmType('missed');
      playMissedDoseSound();

      // Senior voice alert
      speakMissedAlert(dose.medicineName, dose.scheduledTime, language);

      // Caretaker audio alert if caretaker monitor is enabled
      if (caretakerAudioEnabled) {
        setTimeout(() => {
          playCaretakerAlertSound();
          speakCaretakerMissedAlert(
            dose.medicineName,
            dose.scheduledTime,
            profile?.patientName || (language === 'hi' ? 'दादाजी' : 'Patient'),
            language
          );
        }, 3500);
      }
    },
    [caretakerAudioEnabled, language, profile]
  );

  // Dismiss / Stop Active Alarm
  const dismissAlarm = () => {
    stopAlarmSound();
    stopSpeaking();
    setActiveAlarmDose(null);
  };

  // Test Caretaker Missed Audio manually
  const testCaretakerAudioAlert = () => {
    playCaretakerAlertSound();
    speakCaretakerMissedAlert(
      'Amlodipine 5mg',
      '09:00',
      profile?.patientName || (language === 'hi' ? 'दादाजी' : 'Patient'),
      language
    );
  };

  // Automatic Background Real-Time Checker:
  // "aisa karo ki dawa na luu to khud se bole wo"
  // Checks scheduled doses every 10 seconds against the clock
  useEffect(() => {
    const autoChecker = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMins}`;
      const totalMinutesNow = now.getHours() * 60 + now.getMinutes();

      if (!todayData?.doses || todayData.doses.length === 0) return;

      todayData.doses.forEach((dose) => {
        if (dose.status !== 'pending' && dose.status !== 'snoozed') return;

        const [doseH, doseM] = dose.scheduledTime.split(':').map(Number);
        const doseTotalMinutes = doseH * 60 + doseM;
        const doseKey = `${dose._id}_${dose.scheduledTime}`;

        // 1. EXACT ALARM TIME MATCH: Ring scheduled alarm
        if (dose.scheduledTime === currentTimeString && !triggeredAlarmsRef.current.has(doseKey)) {
          triggeredAlarmsRef.current.add(doseKey);
          triggerScheduledAlarm(dose);
        }

        // 2. OVERDUE MISSED TIME (Passed by 10 minutes and not taken):
        // Automatically speak and alert: "Aapne dawai miss kar di!"
        if (totalMinutesNow > doseTotalMinutes + 10 && !triggeredMissedRef.current.has(doseKey)) {
          triggeredMissedRef.current.add(doseKey);

          // Mark as missed in backend
          doseApi
            .markMissed(dose._id, 'Auto-detected: Time passed without taking')
            .then(() => {
              fetchTodayDoses();
              fetchAlerts();
            })
            .catch((e) => console.warn(e));

          triggerMissedAlarm(dose);
        }
      });
    }, 10000);

    return () => clearInterval(autoChecker);
  }, [todayData, triggerScheduledAlarm, triggerMissedAlarm, fetchTodayDoses, fetchAlerts]);

  // Action: Mark Dose Taken
  const handleMarkTaken = async (doseId) => {
    dismissAlarm();
    playTakenSuccessSound();

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }

    speakPraise(language);

    try {
      await doseApi.markTaken(doseId);
      await fetchTodayDoses();
      await fetchMedicines();
    } catch (err) {
      console.error('Error marking taken:', err);
    }
  };

  // Action: Mark Dose Missed
  const handleMarkMissed = async (doseId, reason) => {
    dismissAlarm();
    const defaultReason = language === 'hi' ? 'दवाई समय पर नहीं ली गई' : 'Dose skipped';
    try {
      const res = await doseApi.markMissed(doseId, reason || defaultReason);
      await fetchTodayDoses();
      await fetchAlerts();

      const medName = res.data?.data?.medicineName || (language === 'hi' ? 'दवाई' : 'Medicine');
      const scheduledTime = res.data?.data?.scheduledTime || '';

      playMissedDoseSound();
      speakMissedAlert(medName, scheduledTime, language);

      // Caretaker alert
      if (caretakerAudioEnabled) {
        setTimeout(() => {
          playCaretakerAlertSound();
          speakCaretakerMissedAlert(
            medName,
            scheduledTime,
            profile?.patientName || (language === 'hi' ? 'दादाजी' : 'Patient'),
            language
          );
        }, 3500);
      }
    } catch (err) {
      console.error('Error marking missed:', err);
    }
  };

  // Action: Snooze Dose
  const handleSnooze = async (doseId, minutes = 10) => {
    dismissAlarm();
    const snoozeMsg =
      language === 'hi'
        ? `दवाई को ${minutes} मिनट के लिए स्नूज़ किया गया। बाद में फिर याद दिलाएंगे।`
        : `Dose snoozed for ${minutes} minutes. We will remind you again.`;
    speakText(snoozeMsg, { lang: language, rate: 0.9 });
    try {
      await doseApi.snooze(doseId, minutes);
      await fetchTodayDoses();
    } catch (err) {
      console.error('Error snoozing dose:', err);
    }
  };

  // Action: Trigger Emergency SOS
  const handleTriggerSOS = async () => {
    setIsSOSActive(true);
    startSirenSound();
    const sosMsg =
      language === 'hi'
        ? 'इमरजेंसी अलार्म बज रहा है! केयरटेकर को सूचना भेजी जा चुकी है। शांत रहें, सहायता आ रही है।'
        : 'Emergency siren active! Alert dispatched to caretaker. Stay calm, help is coming.';
    speakText(sosMsg, { lang: language, rate: 0.85 });

    try {
      await alertApi.triggerSOS(
        language === 'hi'
          ? 'मरीज ने सहायता के लिए लाल इमरजेंसी SOS बटन दबाया है!'
          : 'Patient pressed the red Emergency SOS button!'
      );
      await fetchAlerts();
    } catch (err) {
      console.error('Error triggering SOS:', err);
    }
  };

  // Stop SOS
  const handleDismissSOS = () => {
    stopAlarmSound();
    stopSpeaking();
    setIsSOSActive(false);
  };

  // Open Add Medicine Modal
  const openAddMedicineModal = () => {
    setEditingMedicine(null);
    setIsAddMedModalOpen(true);
  };

  // Open Edit Medicine Modal
  const openEditMedicineModal = (medicine) => {
    setEditingMedicine(medicine);
    setIsAddMedModalOpen(true);
  };

  // Delete Medicine
  const handleDeleteMedicine = async (medicineId) => {
    if (!window.confirm(language === 'hi' ? 'क्या आप इस दवाई को हटाना चाहते हैं?' : 'Delete this medicine?')) {
      return;
    }
    try {
      await medicineApi.delete(medicineId);
      await fetchMedicines();
      await fetchTodayDoses();
    } catch (err) {
      console.error('Error deleting medicine:', err);
    }
  };

  // Authentication Handlers
  const handleLogin = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.data);
        localStorage.setItem('ayushcare_token', res.data.token);
        localStorage.setItem('ayushcare_user', JSON.stringify(res.data.data));
        setIsAuthModalOpen(false);

        // Auto-switch mode based on role
        if (res.data.data.role === 'caretaker') {
          setActiveMode('caretaker');
        } else {
          setActiveMode('senior');
        }

        speakText(
          language === 'hi'
            ? `स्वागत है ${res.data.data.name}!`
            : `Welcome ${res.data.data.name}!`,
          { lang: language }
        );
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      return { success: false, error: msg };
    }
  };

  const handleRegister = async (formData) => {
    try {
      const res = await authApi.register(formData);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.data);
        localStorage.setItem('ayushcare_token', res.data.token);
        localStorage.setItem('ayushcare_user', JSON.stringify(res.data.data));
        setIsAuthModalOpen(false);

        if (res.data.data.role === 'caretaker') {
          setActiveMode('caretaker');
        } else {
          setActiveMode('senior');
        }

        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      return { success: false, error: msg };
    }
  };

  const handleDemoLogin = async (role) => {
    try {
      const res = await authApi.demoLogin(role);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.data);
        localStorage.setItem('ayushcare_token', res.data.token);
        localStorage.setItem('ayushcare_user', JSON.stringify(res.data.data));
        setIsAuthModalOpen(false);

        if (role === 'caretaker') {
          setActiveMode('caretaker');
        } else {
          setActiveMode('senior');
        }

        speakText(
          language === 'hi'
            ? `${res.data.data.name} के रूप में लॉगिन सफल!`
            : `Logged in as ${res.data.data.name}!`,
          { lang: language }
        );
      }
    } catch (err) {
      console.error('Demo login error:', err);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ayushcare_token');
    localStorage.removeItem('ayushcare_user');
    speakText(language === 'hi' ? 'लॉगआउट हो गया।' : 'Logged out.', { lang: language });
  };

  const handleLinkPatient = async (patientCode) => {
    try {
      const res = await authApi.linkPatient(patientCode);
      if (res.data.success) {
        // Refresh me
        const meRes = await authApi.getMe();
        if (meRes.data.success) {
          setUser(meRes.data.data);
          localStorage.setItem('ayushcare_user', JSON.stringify(meRes.data.data));
        }
        await fetchTodayDoses();
        await fetchMedicines();
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  return (
    <AppContext.Provider
      value={{
        // Language
        language,
        setLanguage,
        toggleLanguage,
        t,

        // Auth
        user,
        token,
        isAuthenticated: !!token,
        isAuthModalOpen,
        setIsAuthModalOpen,
        handleLogin,
        handleRegister,
        handleDemoLogin,
        handleLogout,
        handleLinkPatient,

        // Modes & Audio
        activeMode,
        setActiveMode,
        caretakerAudioEnabled,
        setCaretakerAudioEnabled,
        testCaretakerAudioAlert,

        // Data
        todayData,
        medicines,
        refillAlerts,
        profile,
        alerts,
        unreadAlertCount,
        activeAlarmDose,
        activeAlarmType,

        // Modals
        isAddMedModalOpen,
        setIsAddMedModalOpen,
        editingMedicine,
        openAddMedicineModal,
        openEditMedicineModal,
        handleDeleteMedicine,
        isVoiceAssistantOpen,
        setIsVoiceAssistantOpen,
        isSOSActive,
        loading,
        currentTime,

        // Refreshes
        fetchTodayDoses,
        fetchMedicines,
        fetchAlerts,
        fetchProfile,

        // Actions
        triggerScheduledAlarm,
        triggerMissedAlarm,
        dismissAlarm,
        handleMarkTaken,
        handleMarkMissed,
        handleSnooze,
        handleTriggerSOS,
        handleDismissSOS,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
