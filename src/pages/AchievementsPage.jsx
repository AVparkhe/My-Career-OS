import React, { useState } from 'react';
import { Trophy, Lock, Star, Plus, X, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './AchievementsPage.css';

export default function AchievementsPage() {
  const { achievements, streak, getXP, getLevel, addAchievement, deleteAchievement } = useApp();
  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);
  const xp = getXP();
  const { level, title: levelTitle } = getLevel();
  const [showAdd, setShowAdd] = useState(false);
  const [newAch, setNewAch] = useState({ title: '', emoji: '🏆', color: 'violet' });

  const colorMap = {
    coral: { bg: 'var(--color-coral-muted)', text: 'var(--color-coral)', gradient: 'var(--gradient-yellow-coral)' },
    yellow: { bg: 'var(--color-yellow-muted)', text: 'var(--color-yellow-dark)', gradient: 'var(--gradient-yellow-coral)' },
    teal: { bg: 'var(--color-teal-muted)', text: 'var(--color-teal)', gradient: 'var(--gradient-teal-aqua)' },
    violet: { bg: 'var(--color-violet-muted)', text: 'var(--color-violet)', gradient: 'var(--gradient-violet-pink)' },
    mint: { bg: 'var(--color-mint-muted)', text: '#2D8B6A', gradient: 'var(--gradient-mint-teal)' },
    pink: { bg: 'var(--color-pink-muted)', text: 'var(--color-pink-dark)', gradient: 'var(--gradient-pink-peach)' },
  };

  const handleAdd = () => {
    if (!newAch.title.trim()) return;
    addAchievement(newAch);
    setNewAch({ title: '', emoji: '🏆', color: 'violet' });
    setShowAdd(false);
  };

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <div>
          <h1 className="achievements-title">
            <Trophy size={28} />
            Achievements
          </h1>
          <p className="achievements-subtitle">Celebrate your milestones and progress 🏆</p>
        </div>
        <div className="achievements-summary">
          <span className="achievements-summary__count">{unlocked.length}/{achievements.length}</span>
          <span className="achievements-summary__label">unlocked</span>
        </div>
      </div>

      {/* Stats Banner — Dynamic */}
      <div className="achievements-banner">
        <div className="achievements-banner__bg" />
        <div className="achievements-banner__content">
          <div className="achievements-banner__stat">
            <span className="achievements-banner__num">🔥 {streak}</span>
            <span className="achievements-banner__label">Day Streak</span>
          </div>
          <div className="achievements-banner__divider" />
          <div className="achievements-banner__stat">
            <span className="achievements-banner__num">🏆 {unlocked.length}</span>
            <span className="achievements-banner__label">Achievements</span>
          </div>
          <div className="achievements-banner__divider" />
          <div className="achievements-banner__stat">
            <span className="achievements-banner__num">⭐ Level {level}</span>
            <span className="achievements-banner__label">{levelTitle}</span>
          </div>
          <div className="achievements-banner__divider" />
          <div className="achievements-banner__stat">
            <span className="achievements-banner__num">✨ {xp}</span>
            <span className="achievements-banner__label">Total XP</span>
          </div>
        </div>
      </div>

      {/* Unlocked */}
      <section>
        <h2 className="achievements-section-title">
          <Star size={20} />
          Unlocked
        </h2>
        <div className="achievements-grid">
          {unlocked.length === 0 && (
            <div className="achievements-empty">
              <p>No achievements unlocked yet. Keep working! 💪</p>
            </div>
          )}
          {unlocked.map((achievement, i) => {
            const colors = colorMap[achievement.color] || colorMap.violet;
            return (
              <div
                key={achievement.id}
                className="achievement-card achievement-card--unlocked animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s`, '--ach-bg': colors.bg, '--ach-text': colors.text, '--ach-gradient': colors.gradient }}
              >
                <div className="achievement-card__badge">
                  <span>{achievement.emoji}</span>
                </div>
                <h3 className="achievement-card__title">{achievement.title}</h3>
                <span className="achievement-card__date">
                  {achievement.date ? new Date(achievement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </span>
                <div className="achievement-card__glow" />
              </div>
            );
          })}
        </div>
      </section>

      {/* Locked */}
      <section>
        <div className="achievements-section-header">
          <h2 className="achievements-section-title">
            <Lock size={20} />
            Coming Soon
          </h2>
          <button className="achievements-add-btn" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Custom
          </button>
        </div>
        <div className="achievements-grid">
          {locked.map((achievement, i) => (
            <div
              key={achievement.id}
              className="achievement-card achievement-card--locked animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="achievement-card__badge achievement-card__badge--locked">
                <Lock size={20} />
              </div>
              <h3 className="achievement-card__title">{achievement.title}</h3>
              <span className="achievement-card__hint">Keep going! ✨</span>
              {!achievement.conditionKey && (
                <button
                  className="achievement-card__delete-btn"
                  onClick={() => deleteAchievement(achievement.id)}
                  title="Remove"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Add Achievement Modal */}
      {showAdd && (
        <div className="dream-modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="dream-modal animate-fade-in-scale" onClick={e => e.stopPropagation()}>
            <button className="dream-modal__close" onClick={() => setShowAdd(false)}>
              <X size={20} />
            </button>
            <h2 className="dream-modal__title">🏆 Custom Achievement</h2>
            <div className="dream-modal__form">
              <div className="dream-modal__field">
                <label>Achievement Name</label>
                <input
                  type="text"
                  placeholder="e.g., Complete 50 LeetCode problems"
                  value={newAch.title}
                  onChange={e => setNewAch({ ...newAch, title: e.target.value })}
                />
              </div>
              <div className="dream-modal__row">
                <div className="dream-modal__field">
                  <label>Emoji</label>
                  <input
                    type="text"
                    placeholder="🏆"
                    value={newAch.emoji}
                    onChange={e => setNewAch({ ...newAch, emoji: e.target.value })}
                    maxLength={4}
                  />
                </div>
                <div className="dream-modal__field">
                  <label>Color</label>
                  <select value={newAch.color} onChange={e => setNewAch({ ...newAch, color: e.target.value })}>
                    <option value="violet">Violet</option>
                    <option value="teal">Teal</option>
                    <option value="coral">Coral</option>
                    <option value="yellow">Yellow</option>
                    <option value="mint">Mint</option>
                    <option value="pink">Pink</option>
                  </select>
                </div>
              </div>
              <button className="dream-modal__submit" onClick={handleAdd}>
                <Trophy size={16} />
                Add Achievement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Motivational Footer */}
      <div className="achievements-footer">
        <p>"The only way to do great work is to love what you do."</p>
        <span>— Keep building your story ✦</span>
      </div>
    </div>
  );
}
