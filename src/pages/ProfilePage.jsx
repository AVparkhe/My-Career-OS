import React, { useState } from 'react';
import { User, Settings, Key, LogOut, Save, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { updateProfile, saveAIApiKey, getAIApiKey } from '../services/authService';
import './ProfilePage.css';

export default function ProfilePage() {
  const { currentUser, handleLogout, clearData } = useApp();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    careerGoal: currentUser?.careerGoal || '',
    role: currentUser?.role || '',
    bio: currentUser?.bio || '',
  });
  const [apiKey, setApiKey] = useState(getAIApiKey());
  const [saved, setSaved] = useState(false);
  const [storageSize, setStorageSize] = useState('Calculating...');

  React.useEffect(() => {
    import('../services/authService').then(m => m.loadAllUserData()).then(data => {
      const bytes = new Blob([JSON.stringify(data)]).size;
      const kb = (bytes / 1024).toFixed(2);
      setStorageSize(`${kb} KB`);
    }).catch(() => setStorageSize('Unknown'));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Failed to save profile: " + err.message);
    }
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    saveAIApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to delete all your goals, journal entries, dreams, and progress? This cannot be undone.")) {
      clearData();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await import('../services/authService').then(m => m.loadAllUserData());
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `career_os_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (err) {
      alert("Failed to export data: " + err.message);
    }
  };

  const handleImportData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const { saveUserData } = await import('../services/authService');
        for (const [key, value] of Object.entries(data)) {
          await saveUserData(key, value);
        }
        alert("Data imported successfully! Reloading...");
        window.location.reload();
      } catch (err) {
        alert("Failed to import data. Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1 className="profile-title">
            <User size={28} />
            My Profile
          </h1>
          <p className="profile-subtitle">Manage your personal data and settings ⚙️</p>
        </div>
        <button className="profile-logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <div className="profile-content">
        <section className="profile-section">
          <div className="profile-section__header">
            <Settings size={20} className="profile-section__icon" />
            <h2>Personal Information</h2>
          </div>
          <form className="profile-form" onSubmit={handleSaveProfile}>
            <div className="profile-field">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="profile-field">
              <label>Current Role / Title</label>
              <input
                type="text"
                placeholder="e.g. Computer Science Student"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>

            <div className="profile-field">
              <label>Ultimate Career Goal</label>
              <input
                type="text"
                placeholder="e.g. Senior AI Engineer at Google"
                value={formData.careerGoal}
                onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
              />
            </div>

            <div className="profile-field">
              <label>Bio</label>
              <textarea
                rows="3"
                placeholder="A bit about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <button type="submit" className="profile-save-btn">
              <Save size={16} />
              Save Profile
            </button>
          </form>
        </section>

        <section className="profile-section">
          <div className="profile-section__header">
            <Key size={20} className="profile-section__icon" />
            <h2>AI Integration Settings</h2>
          </div>
          <p className="profile-help-text">
            Enter your Google Gemini API key to enable the AI Coach and advanced progress analysis.
            Your key is stored locally in your browser and never sent anywhere else.
          </p>
          <form className="profile-form" onSubmit={handleSaveKey}>
            <div className="profile-field">
              <label>Gemini API Key</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <button type="submit" className="profile-save-btn profile-save-btn--secondary">
              <Save size={16} />
              Save API Key
            </button>
          </form>
        </section>

        <section className="profile-section profile-danger-zone">
          <div className="profile-section__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <AlertTriangle size={20} className="profile-danger-icon" />
              <h2>Data Management</h2>
            </div>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Storage: {storageSize}</span>
          </div>
          <p className="profile-help-text">
            Export your data for backup or import an existing backup. Clearing your data is irreversible.
          </p>
          <div className="profile-data-actions">
            <button type="button" className="profile-btn profile-btn--export" onClick={handleExportData}>
              Export Data
            </button>
            <label className="profile-btn profile-btn--import">
              Import Data
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportData} />
            </label>
            <button type="button" className="profile-clear-btn" onClick={handleClearData}>
              <Trash2 size={16} />
              Clear All Data
            </button>
          </div>
        </section>
      </div>
      {saved && (
        <div className="profile-toast animate-fade-in-up">
          Settings saved successfully! ✨
        </div>
      )}
    </div>
  );
}
