import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Target, Sparkles, BookOpen, ArrowRight, Zap, Calendar, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './HomePage.css';

export default function HomePage() {
  const { goals, streak, journalEntries, dreams, schedule, setFreeNowOpen, setAiCoachOpen } = useApp();
  const navigate = useNavigate();
  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good Morning' : today.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const todayKey = today.toISOString().split('T')[0];
  const todaySchedule = schedule[todayKey];

  // Calculate total progress gracefully
  const totalCompleted = goals.reduce((acc, g) => acc + g.subjects.reduce((a, s) => a + s.completed, 0), 0);
  const totalItems = goals.reduce((acc, g) => acc + g.subjects.reduce((a, s) => a + s.total, 0), 0);
  const overallProgress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero__bg">
          <div className="home-hero__blob home-hero__blob--1" />
          <div className="home-hero__blob home-hero__blob--2" />
        </div>
        <div className="home-hero__content">
          <div className="home-hero__text">
            <span className="home-hero__greeting">{greeting} ☀️</span>
            <h1 className="home-hero__title">Welcome to your<br /><span className="home-hero__highlight">Personal World</span></h1>
            <p className="home-hero__sub">Keep going — you've been consistent for <strong>{streak} days</strong>. That's incredible! ✨</p>
          </div>
          <div className="home-hero__progress-ring">
            <svg viewBox="0 0 120 120" className="home-hero__ring-svg">
              <circle cx="60" cy="60" r="52" className="home-hero__ring-bg" />
              <circle
                cx="60" cy="60" r="52"
                className="home-hero__ring-fill"
                style={{
                  strokeDasharray: `${2 * Math.PI * 52}`,
                  strokeDashoffset: `${2 * Math.PI * 52 * (1 - overallProgress / 100)}`,
                }}
              />
            </svg>
            <div className="home-hero__ring-text">
              <span className="home-hero__ring-pct">{overallProgress}%</span>
              <span className="home-hero__ring-label">Overall</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="home-stats">
        <div className="home-stat home-stat--streak">
          <div className="home-stat__icon"><Flame size={20} /></div>
          <div>
            <div className="home-stat__value">{streak}</div>
            <div className="home-stat__label">Day Streak 🔥</div>
          </div>
        </div>
        <div className="home-stat home-stat--goals">
          <div className="home-stat__icon"><Target size={20} /></div>
          <div>
            <div className="home-stat__value">{goals.length}</div>
            <div className="home-stat__label">Active Goals</div>
          </div>
        </div>
        <div className="home-stat home-stat--entries">
          <div className="home-stat__icon"><BookOpen size={20} /></div>
          <div>
            <div className="home-stat__value">{journalEntries.length}</div>
            <div className="home-stat__label">Journal Entries</div>
          </div>
        </div>
        <div className="home-stat home-stat--dreams">
          <div className="home-stat__icon"><Sparkles size={20} /></div>
          <div>
            <div className="home-stat__value">{dreams.length}</div>
            <div className="home-stat__label">Dreams ✨</div>
          </div>
        </div>
      </section>

      {/* I'm Free Now CTA */}
      <section className="home-free-cta" onClick={() => setFreeNowOpen(true)}>
        <div className="home-free-cta__bg">
          <div className="home-free-cta__particle home-free-cta__particle--1" />
          <div className="home-free-cta__particle home-free-cta__particle--2" />
          <div className="home-free-cta__particle home-free-cta__particle--3" />
        </div>
        <div className="home-free-cta__content">
          <div className="home-free-cta__icon">
            <Zap size={28} />
          </div>
          <div>
            <h3 className="home-free-cta__title">I'm Free Now! ✨</h3>
            <p className="home-free-cta__desc">Got some spare time? Let me find the perfect activity for you</p>
          </div>
          <ArrowRight size={24} className="home-free-cta__arrow" />
        </div>
      </section>

      {/* Today's Progress */}
      <section className="home-section">
        <div className="home-section__header">
          <h2 className="home-section__title">
            <Calendar size={20} />
            Today's Progress
          </h2>
          <span className="home-section__date">{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>

        {todaySchedule && (
          <div className={`home-today home-today--${todaySchedule.status}`}>
            <div className="home-today__badge">
              {todaySchedule.status === 'completed' ? '✓ Completed' :
               todaySchedule.status === 'partial' ? '◐ Partial' :
               todaySchedule.status === 'missed' ? '✕ Missed' : '— Unscheduled'}
            </div>
            {todaySchedule.subjects.length > 0 && (
              <div className="home-today__subjects">
                {todaySchedule.subjects.map((s, i) => (
                  <span key={i} className="home-today__subject-chip">{s}</span>
                ))}
              </div>
            )}
            {todaySchedule.time && (
              <div className="home-today__meta">
                <span><Clock size={14} /> Started at {todaySchedule.time}</span>
                <span>⏱️ {todaySchedule.duration}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Goals Overview */}
      <section className="home-section">
        <div className="home-section__header">
          <h2 className="home-section__title">
            <Target size={20} />
            Your Goals
          </h2>
          <button className="home-section__link" onClick={() => navigate('/goals')}>
            See all <ArrowRight size={14} />
          </button>
        </div>

        <div className="home-goals-grid">
          {goals.length === 0 ? (
            <div className="home-empty-state">
              <Target size={32} />
              <p>No goals set yet.</p>
              <button className="home-empty-btn" onClick={() => navigate('/goals')}>Set a Goal</button>
            </div>
          ) : (
            goals.map((goal, i) => {
              const subjectTotal = goal.subjects.reduce((a, s) => a + s.total, 0);
              const subjectCompleted = goal.subjects.reduce((a, s) => a + s.completed, 0);
              const progress = subjectTotal > 0 ? Math.round((subjectCompleted / subjectTotal) * 100) : 0;
              return (
                <div
                  key={goal.id}
                  className="home-goal-card animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s`, '--card-gradient': goal.gradient }}
                  onClick={() => navigate('/goals')}
                >
                  <div className="home-goal-card__header">
                    <span className="home-goal-card__emoji">{goal.emoji}</span>
                    <div className="home-goal-card__mini-ring">
                      <svg viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="14"
                          fill="none" stroke="white" strokeWidth="3"
                          strokeDasharray={`${2 * Math.PI * 14}`}
                          strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                        />
                      </svg>
                      <span className="home-goal-card__mini-pct">{progress}%</span>
                    </div>
                  </div>
                  <h3 className="home-goal-card__title">{goal.title}</h3>
                  <p className="home-goal-card__motivation">{goal.motivationalText}</p>
                  <div className="home-goal-card__subjects">
                    {goal.subjects.slice(0, 3).map((s) => (
                      <span key={s.id} className="home-goal-card__subject">{s.icon} {s.name}</span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Recent Journal */}
      <section className="home-section">
        <div className="home-section__header">
          <h2 className="home-section__title">
            <BookOpen size={20} />
            Recent Reflections
          </h2>
          <button className="home-section__link" onClick={() => navigate('/journal')}>
            See all <ArrowRight size={14} />
          </button>
        </div>

        <div className="home-journal-list">
          {journalEntries.length === 0 ? (
            <div className="home-empty-state">
              <BookOpen size={32} />
              <p>Your journal is empty.</p>
              <button className="home-empty-btn" onClick={() => navigate('/journal')}>Write Entry</button>
            </div>
          ) : (
            journalEntries.slice(0, 3).map((entry, i) => (
              <div key={entry.id} className="home-journal-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="home-journal-card__mood">{entry.mood}</div>
                <div className="home-journal-card__content">
                  <h4>{entry.title}</h4>
                  <p>{entry.content.substring(0, 80)}...</p>
                  <div className="home-journal-card__tags">
                    {entry.tags.slice(0, 3).map((t) => (
                      <span key={t} className="home-journal-card__tag">#{t}</span>
                    ))}
                  </div>
                </div>
                <div className="home-journal-card__date">
                  {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* AI Coach CTA */}
      <section className="home-coach-cta" onClick={() => setAiCoachOpen(true)}>
        <div className="home-coach-cta__orb animate-breathe">
          <Sparkles size={24} />
        </div>
        <div>
          <h3 className="home-coach-cta__title">Talk to your AI Coach</h3>
          <p className="home-coach-cta__desc">Get personalized guidance, plan your day, or just chat about your goals</p>
        </div>
        <ArrowRight size={20} className="home-coach-cta__arrow" />
      </section>

      {/* Dreams Preview */}
      <section className="home-section">
        <div className="home-section__header">
          <h2 className="home-section__title">
            <Sparkles size={20} />
            Your Dreams
          </h2>
          <button className="home-section__link" onClick={() => navigate('/dreams')}>
            See all <ArrowRight size={14} />
          </button>
        </div>
        <div className="home-dreams-scroll">
          {dreams.length === 0 ? (
            <div className="home-empty-state">
              <Sparkles size={32} />
              <p>No dreams added yet.</p>
              <button className="home-empty-btn" onClick={() => navigate('/dreams')}>Dream Big</button>
            </div>
          ) : (
            dreams.slice(0, 3).map((dream, i) => (
              <div
                key={dream.id}
                className="home-dream-card animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s`, '--dream-gradient': dream.gradient }}
              >
                <span className="home-dream-card__emoji">{dream.emoji}</span>
                <h4 className="home-dream-card__title">{dream.title}</h4>
                <p className="home-dream-card__target">Target: {dream.target}</p>
                <div className="home-dream-card__progress-bar">
                  <div className="home-dream-card__progress-fill" style={{ width: `${dream.progress}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
