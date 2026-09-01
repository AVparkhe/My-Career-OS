import React, { useState } from 'react';
import { Target, CheckCircle2, Circle, TrendingUp, Flame, Calendar, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import AddGoalModal from '../components/AddGoalModal';
import './GoalsPage.css';

export default function GoalsPage() {
  const { goals, updateGoalProgress, deleteGoal, streak, schedule } = useApp();
  const [selectedGoal, setSelectedGoal] = useState(goals[0]?.id || null);
  const [completedAnim, setCompletedAnim] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const activeGoal = goals.find(g => g.id === selectedGoal) || goals[0];

  const handleComplete = (subjectIndex) => {
    updateGoalProgress(activeGoal.id, subjectIndex, 1);
    setCompletedAnim(activeGoal.subjects[subjectIndex].id);
    setTimeout(() => setCompletedAnim(null), 1500);
  };

  // Calendar data
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="goals-page">
      <div className="goals-page__header">
        <h1 className="goals-page__title">
          <Target size={28} />
          Goal Tracker
        </h1>
        <div className="goals-page__streak">
          <Flame size={18} />
          <span>{streak} day streak</span>
        </div>
      </div>

      {/* Goal Selector */}
      <div className="goals-selector">
        {goals.map((goal) => {
          const subjectTotal = goal.subjects.reduce((a, s) => a + s.total, 0);
          const subjectCompleted = goal.subjects.reduce((a, s) => a + s.completed, 0);
          const progress = subjectTotal > 0 ? Math.round((subjectCompleted / subjectTotal) * 100) : 0;
          return (
            <button
              key={goal.id}
              className={`goals-selector__btn ${selectedGoal === goal.id ? 'goals-selector__btn--active' : ''}`}
              onClick={() => setSelectedGoal(goal.id)}
              style={{ '--btn-gradient': goal.gradient }}
            >
              <span className="goals-selector__emoji">{goal.emoji}</span>
              <span className="goals-selector__name">{goal.title}</span>
              <span className="goals-selector__pct">{progress}%</span>
            </button>
          );
        })}
        <button 
          className="goals-selector__btn goals-selector__btn--add"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={20} />
          <span className="goals-selector__name">Add Goal</span>
        </button>
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="goals-empty animate-fade-in-up">
          <div className="goals-empty__icon"><Target size={48} /></div>
          <h2>No Goals Yet</h2>
          <p>Setting goals is the first step in turning the invisible into the visible.</p>
          <button className="goals-empty__btn" onClick={() => setIsAddModalOpen(true)}>
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Main Goal View */}
      {activeGoal && (
        <div className="goals-main">
          {/* Delete button */}
          <div className="goals-main__actions">
            <button
              className="goals-delete-btn"
              onClick={() => {
                if (window.confirm(`Delete "${activeGoal.title}"? This cannot be undone.`)) {
                  deleteGoal(activeGoal.id);
                  setSelectedGoal(goals[0]?.id || null);
                }
              }}
              title="Delete this goal"
            >
              <Trash2 size={16} /> Delete Goal
            </button>
          </div>
          {/* Circular Progress */}
          <div className="goals-circle-section">
            <div className="goals-circle">
              <svg viewBox="0 0 200 200" className="goals-circle__svg">
                <defs>
                  <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B6FF7" />
                    <stop offset="100%" stopColor="#F5A7D7" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="85" className="goals-circle__bg" />
                <circle
                  cx="100" cy="100" r="85"
                  className="goals-circle__fill"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 85}`,
                    strokeDashoffset: `${2 * Math.PI * 85 * (1 - (activeGoal.subjects.reduce((a, s) => a + s.completed, 0) / activeGoal.subjects.reduce((a, s) => a + s.total, 0)))}`,
                  }}
                />
              </svg>
              <div className="goals-circle__text">
                <span className="goals-circle__pct">
                  {Math.round(activeGoal.subjects.reduce((a, s) => a + s.completed, 0) / activeGoal.subjects.reduce((a, s) => a + s.total, 0) * 100)}%
                </span>
                <span className="goals-circle__label">{activeGoal.motivationalText}</span>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="goals-subjects">
            <h2 className="goals-subjects__title">Subjects</h2>
            {activeGoal.subjects.map((subject, i) => {
              const pct = Math.round(subject.completed / subject.total * 100);
              return (
                <div
                  key={subject.id}
                  className={`goals-subject animate-fade-in-up ${completedAnim === subject.id ? 'goals-subject--celebrating' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s`, '--subject-color': subject.color }}
                >
                  <div className="goals-subject__header">
                    <span className="goals-subject__icon">{subject.icon}</span>
                    <span className="goals-subject__name">{subject.name}</span>
                    <span className="goals-subject__count">{subject.completed}/{subject.total}</span>
                  </div>
                  <div className="goals-subject__bar">
                    <div
                      className="goals-subject__bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="goals-subject__footer">
                    <span className="goals-subject__pct">{pct}%</span>
                    <button
                      className="goals-subject__complete-btn"
                      onClick={() => handleComplete(i)}
                      disabled={subject.completed >= subject.total}
                      aria-label={`Mark ${subject.name} session complete`}
                    >
                      <CheckCircle2 size={16} />
                      Complete Session
                    </button>
                  </div>
                  {completedAnim === subject.id && (
                    <div className="goals-subject__celebrate">
                      {[...Array(8)].map((_, j) => (
                        <div
                          key={j}
                          className="goals-subject__spark"
                          style={{
                            '--angle': `${j * 45}deg`,
                            '--color': ['var(--color-mint)', 'var(--color-yellow)', 'var(--color-violet)'][j % 3],
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Tracker */}
      <div className="goals-calendar">
        <h2 className="goals-calendar__title">
          <Calendar size={20} />
          {monthName}
        </h2>
        <div className="goals-calendar__legend">
          <span className="goals-cal-legend goals-cal-legend--completed">✓ Completed</span>
          <span className="goals-cal-legend goals-cal-legend--partial">◐ Partial</span>
          <span className="goals-cal-legend goals-cal-legend--missed">✕ Missed</span>
          <span className="goals-cal-legend goals-cal-legend--unscheduled">— Unscheduled</span>
        </div>
        <div className="goals-calendar__grid">
          <div className="goals-cal-header">Sun</div>
          <div className="goals-cal-header">Mon</div>
          <div className="goals-cal-header">Tue</div>
          <div className="goals-cal-header">Wed</div>
          <div className="goals-cal-header">Thu</div>
          <div className="goals-cal-header">Fri</div>
          <div className="goals-cal-header">Sat</div>

          {/* Empty cells for first day offset */}
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} className="goals-cal-cell goals-cal-cell--empty" />
          ))}

          {/* Day cells */}
          {[...Array(daysInMonth)].map((_, i) => {
            const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
            const key = date.toISOString().split('T')[0];
            const dayData = schedule[key];
            const isToday = date.toDateString() === today.toDateString();
            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            let status = dayData?.status || 'unscheduled';
            if (!dayData && isPast) {
              status = 'missed';
            }

            return (
              <div
                key={i}
                className={`goals-cal-cell goals-cal-cell--${status} ${isToday ? 'goals-cal-cell--today' : ''}`}
                title={`${date.toLocaleDateString()} - ${status}`}
              >
                <span className="goals-cal-cell__day">{i + 1}</span>
                <span className="goals-cal-cell__status">
                  {status === 'completed' ? '✓' : status === 'partial' ? '◐' : status === 'missed' ? '✕' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <AddGoalModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
