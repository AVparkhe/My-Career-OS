import React, { useState } from 'react';
import { PenTool, Plus, Mic, X, Clock, Tag, Hash, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './JournalPage.css';

const moods = ['🔥', '✨', '🙂', '😴', '💭', '🌟', '😤', '🥺'];
const entryTypes = [
  { value: 'reflection', label: '💭 Reflection', color: 'var(--color-pink)' },
  { value: 'learning', label: '📚 Learning', color: 'var(--color-teal)' },
  { value: 'achievement', label: '🏆 Achievement', color: 'var(--color-yellow)' },
  { value: 'gratitude', label: '🙏 Gratitude', color: 'var(--color-mint)' },
  { value: 'idea', label: '💡 Idea', color: 'var(--color-violet)' },
];

export default function JournalPage() {
  const { journalEntries, addJournalEntry, deleteJournalEntry } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '', content: '', mood: '🙂', energy: 'normal', tags: '', type: 'reflection', duration: '',
  });

  const handleAdd = () => {
    if (!newEntry.title.trim()) return;
    addJournalEntry({
      ...newEntry,
      tags: newEntry.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setNewEntry({ title: '', content: '', mood: '🙂', energy: 'normal', tags: '', type: 'reflection', duration: '' });
    setShowAdd(false);
  };

  const handleDeleteEntry = (entryId) => {
    deleteJournalEntry(entryId);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in your browser. Try Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNewEntry(prev => ({ ...prev, content: prev.content + (prev.content ? ' ' : '') + transcript }));
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
  };

  const getTypeColor = (type) => {
    const found = entryTypes.find(t => t.value === type);
    return found?.color || 'var(--color-violet)';
  };

  const getTypeLabel = (type) => {
    const found = entryTypes.find(t => t.value === type);
    return found?.label || type;
  };

  // Group by date
  const grouped = journalEntries.reduce((acc, entry) => {
    const date = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  return (
    <div className="journal-page">
      <div className="journal-header">
        <div>
          <h1 className="journal-title">
            <PenTool size={28} />
            Career Journal
          </h1>
          <p className="journal-subtitle">Your personal diary of growth and reflection ✍️</p>
        </div>
        <button className="journal-add-btn" onClick={() => setShowAdd(true)}>
          <Plus size={18} />
          New Entry
        </button>
      </div>

      {/* Timeline */}
      <div className="journal-timeline">
        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date} className="journal-day">
            <div className="journal-day__header">
              <div className="journal-day__dot" />
              <h3 className="journal-day__date">{date}</h3>
            </div>

            <div className="journal-day__entries">
              {entries.map((entry, i) => (
                <div
                  key={entry.id}
                  className="journal-entry animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s`, '--entry-color': getTypeColor(entry.type) }}
                >
                  <div className="journal-entry__header">
                    <span className="journal-entry__mood">{entry.mood}</span>
                    <div className="journal-entry__info">
                      <h4 className="journal-entry__title">{entry.title}</h4>
                      <div className="journal-entry__meta">
                        <span className="journal-entry__type" style={{ background: `${getTypeColor(entry.type)}20`, color: getTypeColor(entry.type) }}>
                          {getTypeLabel(entry.type)}
                        </span>
                        {entry.duration && (
                          <span className="journal-entry__duration">
                            <Clock size={12} /> {entry.duration}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="journal-entry__actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="journal-entry__time">
                        {new Date(entry.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <button
                        className="journal-entry__delete"
                        onClick={() => handleDeleteEntry(entry.id)}
                        title="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="journal-entry__content">{entry.content}</p>

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="journal-entry__tags">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="journal-entry__tag">
                          <Hash size={10} />{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Decorative line on left */}
                  <div className="journal-entry__accent" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Entry Modal */}
      {showAdd && (
        <div className="journal-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="journal-modal animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
            <button className="journal-modal__close" onClick={() => setShowAdd(false)}>
              <X size={20} />
            </button>
            <h2 className="journal-modal__title">✍️ New Journal Entry</h2>

            <div className="journal-modal__form">
              {/* Mood Selector */}
              <div className="journal-modal__field">
                <label>How are you feeling?</label>
                <div className="journal-mood-selector">
                  {moods.map((m) => (
                    <button
                      key={m}
                      className={`journal-mood-btn ${newEntry.mood === m ? 'journal-mood-btn--active' : ''}`}
                      onClick={() => setNewEntry({ ...newEntry, mood: m })}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div className="journal-modal__field">
                <label>Entry Type</label>
                <div className="journal-type-selector">
                  {entryTypes.map((t) => (
                    <button
                      key={t.value}
                      className={`journal-type-btn ${newEntry.type === t.value ? 'journal-type-btn--active' : ''}`}
                      onClick={() => setNewEntry({ ...newEntry, type: t.value })}
                      style={{ '--type-color': t.color }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="journal-modal__field">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="What happened today?"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                />
              </div>

              <div className="journal-modal__field">
                <label>Your thoughts</label>
                <textarea
                  placeholder="Write your heart out..."
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Voice Input */}
              <div className="journal-voice-section">
                <button
                  className={`journal-voice-btn ${isRecording ? 'journal-voice-btn--active' : ''}`}
                  onClick={handleVoiceInput}
                >
                  <Mic size={20} />
                  {isRecording ? (
                    <div className="journal-voice-wave">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="journal-voice-wave__bar" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  ) : (
                    <span>Or speak your thoughts</span>
                  )}
                </button>
              </div>

              <div className="journal-modal__row">
                <div className="journal-modal__field">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="dsa, learning, breakthrough"
                    value={newEntry.tags}
                    onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                  />
                </div>
                <div className="journal-modal__field">
                  <label>Duration</label>
                  <input
                    type="text"
                    placeholder="1h 30m"
                    value={newEntry.duration}
                    onChange={(e) => setNewEntry({ ...newEntry, duration: e.target.value })}
                  />
                </div>
              </div>

              <button className="journal-modal__submit" onClick={handleAdd}>
                <PenTool size={16} />
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
