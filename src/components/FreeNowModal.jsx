import React, { useState, useEffect } from 'react';
import { X, Zap, Brain, Battery, Play, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateFreeSuggestions } from '../services/aiService';
import { getAIApiKey } from '../services/authService';
import './FreeNowModal.css';

const timeOptions = [
  { val: 5, label: '5 min', icon: Zap },
  { val: 10, label: '10 min', icon: '⏱️' },
  { val: 15, label: '15 min', icon: '🕒' },
  { val: 30, label: '30 min', icon: '⏳' },
];

const energyOptions = [
  { id: 'low', label: 'Brain Dead', icon: '🔋', color: 'var(--color-pink)' },
  { id: 'med', label: 'Normal', icon: '⚡', color: 'var(--color-teal)' },
  { id: 'high', label: 'Let\'s Go!', icon: '🔥', color: 'var(--color-coral)' },
];

const activityOptions = [
  { id: 'learn', label: 'Learn something new', icon: Brain },
  { id: 'review', label: 'Review what I know', icon: CheckCircle },
  { id: 'chill', label: 'Just relax & inspire me', icon: Battery },
];

export default function FreeNowModal() {
  const context = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({ time: null, energy: null, activity: null });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setStep(1);
      setPreferences({ time: null, energy: null, activity: null });
    };
    window.addEventListener('openFreeNowModal', handleOpen);
    return () => window.removeEventListener('openFreeNowModal', handleOpen);
  }, []);

  const handleNext = async (key, val) => {
    const newPrefs = { ...preferences, [key]: val };
    setPreferences(newPrefs);
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      setStep(4);
      setLoading(true);
      
      const apiKey = getAIApiKey();
      try {
        if (apiKey) {
           const result = await generateFreeSuggestions(newPrefs, context);
           setSuggestions(result);
        } else {
           // Mock
           setTimeout(() => {
             setSuggestions([
               { title: 'Quick UI Polish', category: 'Design', duration: `${newPrefs.time} min`, emoji: '🎨', description: 'Tweak some CSS variables for better contrast.' },
               { title: 'Read tech article', category: 'Learning', duration: `${newPrefs.time} min`, emoji: '📖', description: 'Catch up on the latest React news.' },
               { title: 'Stretching', category: 'Health', duration: `${newPrefs.time} min`, emoji: '🧘', description: 'Step away from the keyboard and stretch.' },
             ]);
             setLoading(false);
           }, 1500);
           return;
        }
      } catch (err) {
        console.error(err);
        setSuggestions([{ title: 'Error generating', category: 'System', duration: '-', emoji: '⚠️', description: 'Could not fetch suggestions.'}]);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="freenow-overlay animate-fade-in" onClick={() => setIsOpen(false)}>
      <div className="freenow-modal animate-scale-up" onClick={e => e.stopPropagation()}>
        <button className="freenow-close" onClick={() => setIsOpen(false)}>
          <X size={20} />
        </button>

        {/* Dynamic Background Blobs based on step */}
        <div className={`freenow-bg freenow-bg--step-${step}`} />

        <div className="freenow-content">
          <div className="freenow-header">
            <div className="freenow-icon-wrapper">
              <Zap size={24} color="white" />
            </div>
            <h2>I'M FREE ✨</h2>
          </div>

          {step === 1 && (
            <div className="freenow-step animate-slide-in-right">
              <h3>How much time do you have?</h3>
              <div className="freenow-grid-2">
                {timeOptions.map(opt => (
                  <button key={opt.val} className="freenow-opt-btn" onClick={() => handleNext('time', opt.val)}>
                    <span className="opt-icon">{typeof opt.icon === 'string' ? opt.icon : <opt.icon size={24} />}</span>
                    <span className="opt-label">{opt.label}</span>
                  </button>
                ))}
              </div>
              <button className="freenow-opt-btn freenow-opt-btn--large" onClick={() => handleNext('time', 60)}>
                <span className="opt-icon">🌟</span>
                <span className="opt-label">60+ min</span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="freenow-step animate-slide-in-right">
              <h3>What's your energy level?</h3>
              <div className="freenow-list">
                {energyOptions.map(opt => (
                  <button 
                    key={opt.id} 
                    className="freenow-row-btn" 
                    onClick={() => handleNext('energy', opt.label)}
                    style={{ '--hover-color': opt.color }}
                  >
                    <span className="row-icon">{opt.icon}</span>
                    <span className="row-label">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="freenow-step animate-slide-in-right">
              <h3>What do you want to do?</h3>
              <div className="freenow-list">
                {activityOptions.map(opt => (
                  <button key={opt.id} className="freenow-row-btn" onClick={() => handleNext('activity', opt.label)}>
                    <span className="row-icon"><opt.icon size={20} /></span>
                    <span className="row-label">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="freenow-step freenow-step--results animate-fade-in">
              {loading ? (
                <div className="freenow-loading">
                  <div className="loading-spinner" />
                  <p>Finding the perfect activities for {preferences.time}m...</p>
                </div>
              ) : (
                <>
                  <h3>Here's what you can do:</h3>
                  <div className="freenow-results">
                    {suggestions.map((sug, i) => (
                      <div key={i} className="freenow-result-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="result-card__header">
                          <span className="result-card__emoji">{sug.emoji}</span>
                          <span className="result-card__tag">{sug.category} • {sug.duration}</span>
                        </div>
                        <h4 className="result-card__title">{sug.title}</h4>
                        <p className="result-card__desc">{sug.description}</p>
                        <button 
                          className="result-card__start"
                          onClick={() => {
                            setIsOpen(false);
                            const event = new CustomEvent('openContentReader', { detail: { topic: sug.title, description: sug.description }});
                            window.dispatchEvent(event);
                          }}
                        >
                          <Play size={14} /> Start
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* Progress dots */}
        <div className="freenow-progress">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`progress-dot ${step >= i ? 'active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
