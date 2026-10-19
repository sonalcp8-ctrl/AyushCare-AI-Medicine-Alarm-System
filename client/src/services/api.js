import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every request if available
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ayushcare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  register: (data) => client.post('/auth/register', data),
  getMe: () => client.get('/auth/me'),
  linkPatient: (patientCode) => client.post('/auth/link-patient', { patientCode }),
  demoLogin: (role) => client.post('/auth/demo-login', { role }),
};

export const medicineApi = {
  getAll: () => client.get('/medicines'),
  getRefills: () => client.get('/medicines/refills'),
  getById: (id) => client.get(`/medicines/${id}`),
  create: (data) => client.post('/medicines', data),
  update: (id, data) => client.put(`/medicines/${id}`, data),
  delete: (id) => client.delete(`/medicines/${id}`),
};

export const doseApi = {
  getToday: () => client.get('/doses/today'),
  markTaken: (id) => client.put(`/doses/${id}/taken`),
  markMissed: (id, reason) => client.put(`/doses/${id}/missed`, { reason }),
  snooze: (id, minutes = 10) => client.put(`/doses/${id}/snooze`, { minutes }),
  checkOverdue: (grace = 15) => client.post(`/doses/check-overdue?grace=${grace}`),
  getHistory: (days = 7) => client.get(`/doses/history?days=${days}`),
};

export const aiApi = {
  checkSafety: (data) => client.post('/ai/safety-check', data),
  parsePrescription: (prescriptionText) => client.post('/ai/parse-prescription', { prescriptionText }),
  voiceQuery: (query) => client.post('/ai/voice-query', { query }),
};

export const profileApi = {
  getProfile: () => client.get('/profile'),
  updateProfile: (data) => client.put('/profile', data),
};

export const alertApi = {
  getAll: () => client.get('/alerts'),
  markRead: (id) => client.put(`/alerts/${id}/read`),
  triggerSOS: (note) => client.post('/alerts/sos', { note }),
  clearAll: () => client.post('/alerts/clear-all'),
};

export default client;
