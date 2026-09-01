import React, { useState } from 'react';
import { Sparkles, Plus, Star, X, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './DreamsPage.css';

export default function DreamsPage() {
  const { dreams, addDream, deleteDream, updateDreamProgress } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newDream, setNewDream] = useState({ title: '', description: '', why: '', target: '', emoji: '✨' });

  const gradients = [
    'var(--gradient-violet-pink)',
    'var(--gradient-teal-aqua)',
    'var(--gradient-lavender-blue)',
    'var(--gradient-yellow-coral)',
    'var(--gradient-pink-peach)',
    'var(--gradient-mint-teal)',
  ];

  const handleAdd = () => {
    if (!newDream.title.trim()) return;
    addDream({
      ...newDream,
      gradient: gradients[dreams.length % gradients.length],
      progress: 0,
    });
    setNewDream({ title: '', description: '', why: '', target: '', emoji: '✨' });
    setShowAdd(false);
  };

  return (
    <div className="dreams-page">
      {/* Dreamy background */}
      <div className="dreams-bg">
        <div className="dreams-bg__star dreams-bg__star--1">✦</div>
        <div className="dreams-bg__star dreams-bg__star--2">✧</div>
        <div className="dreams-bg__star dreams-bg__star--3">✦</div>
        <div className="dreams-bg__star dreams-bg__star--4">⋆</div>
        <div className="dreams-bg__star dreams-bg__star--5">✧</div>
        <div className="dreams-bg__star dreams-bg__star--6">✦</div>
        <div className="dreams-bg__blob dreams-bg__blob--1" />
        <div className="dreams-bg__blob dreams-bg__blob--2" />
      </div>

      <div className="dreams-header">
        <div>
          <h1 className="dreams-title">
            <Sparkles size={28} />
            My Dreams
          </h1>
          <p className="dreams-subtitle">Your vision board for the future ✨</p>
        </div>
        <button className="dreams-add-btn" onClick={() => setShowAdd(true)}>
          <Plus size={18} />
          New Dream
        </button>
      </div>

      {/* Dreams Grid - Vision Board Style */}
      <div className="dreams-grid">
        {dreams.map((dream, i) => (
          <div
            key={dream.id}
            className={`dream-card animate-fade-in-up dream-card--size-${(i % 3) + 1}`}
            style={{ animationDelay: `${i * 0.1}s`, '--dream-gradient': dream.gradient }}
          >
            <div className="dream-card__bg-pattern" />
            <div className="dream-card__content">
              <span className="dream-card__emoji">{dream.emoji}</span>
              <h3 className="dream-card__title">{dream.title}</h3>
              <p className="dream-card__desc">{dream.description}</p>

              <div className="dream-card__why">
                <span className="dream-card__why-label">Why this matters</span>
                <p>{dream.why}</p>
              </div>

            <div className="dream-card__footer">
                <span className="dream-card__target">🎯 Target: {dream.target}</span>
                <div className="dream-card__progress">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={dream.progress}
                    onChange={(e) => updateDreamProgress(dream.id, parseInt(e.target.value))}
                    className="dream-card__slider"
                  />
                  <span className="dream-card__progress-pct">{dream.progress}%</span>
                </div>
              </div>

              <button
                className="dream-card__delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete "${dream.title}"?`)) deleteDream(dream.id);
                }}
                title="Delete dream"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Dream Modal */}
      {showAdd && (
        <div className="dream-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="dream-modal animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
            <button className="dream-modal__close" onClick={() => setShowAdd(false)}>
              <X size={20} />
            </button>
            <h2 className="dream-modal__title">✨ New Dream</h2>
            <div className="dream-modal__form">
              <div className="dream-modal__field">
                <label>What's your dream?</label>
                <input
                  type="text"
                  placeholder="e.g., Build my own startup"
                  value={newDream.title}
                  onChange={(e) => setNewDream({ ...newDream, title: e.target.value })}
                />
              </div>
              <div className="dream-modal__field">
                <label>Describe it</label>
                <textarea
                  placeholder="Tell me more about this dream..."
                  value={newDream.description}
                  onChange={(e) => setNewDream({ ...newDream, description: e.target.value })}
                />
              </div>
              <div className="dream-modal__field">
                <label>Why does this matter to you?</label>
                <input
                  type="text"
                  placeholder="Your motivation..."
                  value={newDream.why}
                  onChange={(e) => setNewDream({ ...newDream, why: e.target.value })}
                />
              </div>
              <div className="dream-modal__row">
                <div className="dream-modal__field">
                  <label>Target Year</label>
                  <input
                    type="text"
                    placeholder="2028"
                    value={newDream.target}
                    onChange={(e) => setNewDream({ ...newDream, target: e.target.value })}
                  />
                </div>
                <div className="dream-modal__field">
                  <label>Emoji</label>
                  <input
                    type="text"
                    placeholder="✨"
                    value={newDream.emoji}
                    onChange={(e) => setNewDream({ ...newDream, emoji: e.target.value })}
                    maxLength={4}
                  />
                </div>
              </div>
              <button className="dream-modal__submit" onClick={handleAdd}>
                <Sparkles size={16} />
                Add to my Dreams
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
