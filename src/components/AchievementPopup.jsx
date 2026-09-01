import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import './AchievementPopup.css';

export default function AchievementPopup() {
  const { showAchievement } = useApp();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (showAchievement) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 2,
        color: ['var(--color-violet)', 'var(--color-coral)', 'var(--color-yellow)', 'var(--color-mint)', 'var(--color-pink)'][Math.floor(Math.random() * 5)],
        size: 4 + Math.random() * 8,
      }));
      setParticles(newParticles);
    }
  }, [showAchievement]);

  if (!showAchievement) return null;

  return (
    <div className="achievement-popup animate-fade-in-scale" role="alert">
      {/* Confetti particles */}
      <div className="achievement-confetti">
        {particles.map((p) => (
          <div
            key={p.id}
            className="achievement-particle"
            style={{
              left: `${p.x}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              background: p.color,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
          />
        ))}
      </div>

      <div className="achievement-content">
        <div className="achievement-glow" />
        <div className="achievement-badge">
          <span className="achievement-badge__emoji">{showAchievement.title?.split(' ')[0] || '🎉'}</span>
        </div>
        <h3 className="achievement-title">{showAchievement.title}</h3>
        <p className="achievement-desc">{showAchievement.description}</p>
      </div>
    </div>
  );
}
