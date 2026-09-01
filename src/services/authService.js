// Backend API based auth & data persistence service

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const STORAGE_KEYS = {
  TOKEN: 'career_os_token',
  CURRENT_USER: 'career_os_current_user',
  AI_API_KEY: 'career_os_ai_key',
};

// --- Helper for Auth Headers ---
const getHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// --- User Management ---

export function getCurrentUser() {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

export async function signUp(userData) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  
  localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(data.user));
  return data.user;
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  
  localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export async function updateProfile(updates) {
  const res = await fetch(`${API_URL}/profile`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update profile');
  
  const currentUser = getCurrentUser();
  const updatedUser = { ...currentUser, ...updates };
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
}

// --- Data Persistence ---

export async function loadAllUserData() {
  const res = await fetch(`${API_URL}/data`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to load data');
  return await res.json();
}

export async function saveUserData(key, data) {
  const res = await fetch(`${API_URL}/data/${key}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) console.error(`Failed to save ${key}`);
}

// --- AI API Key Storage ---
export function saveAIApiKey(key) {
  if (key) {
    localStorage.setItem(STORAGE_KEYS.AI_API_KEY, key);
  } else {
    localStorage.removeItem(STORAGE_KEYS.AI_API_KEY);
  }
}

export function getAIApiKey() {
  return localStorage.getItem(STORAGE_KEYS.AI_API_KEY);
}

// --- Activity Logging ---
export async function logActivity(activity) {
  const logs = (await fetch(`${API_URL}/data/activity`, { headers: getHeaders() }).then(r => r.json()).catch(() => [])) || [];
  const updatedLogs = [{ ...activity, timestamp: new Date().toISOString() }, ...logs].slice(0, 50);
  saveUserData('activity', updatedLogs);
}

// --- Daily Scores Storage ---
export async function saveDailyScore(date, score) {
  const currentScores = (await fetch(`${API_URL}/data/dailyScores`, { headers: getHeaders() }).then(r => r.json()).catch(() => {})) || {};
  currentScores[date] = score;
  saveUserData('dailyScores', currentScores);
}

export async function getDailyScores() {
  return await fetch(`${API_URL}/data/dailyScores`, { headers: getHeaders() }).then(r => r.json()).catch(() => ({}));
}
