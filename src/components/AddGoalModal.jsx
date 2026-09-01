import React, { useState } from 'react';
import { X, Plus, Target, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './AddGoalModal.css';

const gradients = [
  'var(--gradient-violet-pink)',
  'var(--gradient-teal-aqua)',
  'var(--gradient-yellow-coral)',
  'var(--gradient-mint-teal)',
  'var(--gradient-lavender-blue)',
  'var(--gradient-pink-peach)',
];

const emojis = ['🎯', '📚', '🤖', '🚀', '💻', '🧠', '💡', '🏆'];

export default function AddGoalModal({ isOpen, onClose }) {
  const { addGoal } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    motivationalText: '',
    emoji: '🎯',
    gradient: gradients[0],
    subjects: [{ name: '', total: 10, icon: '📖' }]
  });

  if (!isOpen) return null;

  const handleAddSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { name: '', total: 10, icon: '📖' }]
    }));
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index][field] = value;
    setFormData(prev => ({ ...prev, subjects: newSubjects }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out empty subjects
    const validSubjects = formData.subjects.filter(s => s.name.trim() !== '');
    if (validSubjects.length === 0 || !formData.title.trim()) return;
    
    addGoal({
      ...formData,
      subjects: validSubjects.map(s => ({ ...s, total: parseInt(s.total) || 10 }))
    });
    
    onClose();
    setStep(1);
    setFormData({
      title: '',
      motivationalText: '',
      emoji: '🎯',
      gradient: gradients[0],
      subjects: [{ name: '', total: 10, icon: '📖' }]
    });
  };

  return (
    <div className="addgoal-overlay animate-fade-in" onClick={onClose}>
      <div className="addgoal-modal animate-scale-up" onClick={e => e.stopPropagation()}>
        <button className="addgoal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="addgoal-header" style={{ background: formData.gradient }}>
          <h2>{step === 1 ? 'Set a New Goal' : 'Add Subjects'}</h2>
          <p>{step === 1 ? 'What do you want to achieve?' : 'Break it down into actionable subjects'}</p>
        </div>

        <div className="addgoal-content">
          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}>
            
            {step === 1 && (
              <div className="addgoal-step animate-slide-in-right">
                <div className="addgoal-field">
                  <label>Goal Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Learn React Native"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="addgoal-field">
                  <label>Motivational Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Building my first mobile app ✨"
                    value={formData.motivationalText}
                    onChange={(e) => setFormData({ ...formData, motivationalText: e.target.value })}
                  />
                </div>

                <div className="addgoal-field">
                  <label>Choose an Emoji</label>
                  <div className="addgoal-emojis">
                    {emojis.map(e => (
                      <button
                        key={e}
                        type="button"
                        className={`addgoal-emoji-btn ${formData.emoji === e ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, emoji: e })}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="addgoal-field">
                  <label>Choose a Theme Color</label>
                  <div className="addgoal-gradients">
                    {gradients.map(g => (
                      <button
                        key={g}
                        type="button"
                        className={`addgoal-gradient-btn ${formData.gradient === g ? 'active' : ''}`}
                        style={{ background: g }}
                        onClick={() => setFormData({ ...formData, gradient: g })}
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" className="addgoal-submit-btn" style={{ background: formData.gradient }}>
                  Next Step <Target size={16} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="addgoal-step animate-slide-in-right">
                <p className="addgoal-help">Add the topics you need to study or practice. Give each a target number of sessions.</p>
                
                <div className="addgoal-subjects-list">
                  {formData.subjects.map((subject, idx) => (
                    <div key={idx} className="addgoal-subject-row">
                      <input
                        type="text"
                        placeholder="Subject (e.g. JavaScript)"
                        value={subject.name}
                        onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)}
                        className="addgoal-subject-input"
                        required={idx === 0}
                      />
                      <input
                        type="number"
                        min="1"
                        max="999"
                        placeholder="Sessions"
                        value={subject.total}
                        onChange={(e) => handleSubjectChange(idx, 'total', e.target.value)}
                        className="addgoal-subject-target"
                        title="Target number of sessions"
                      />
                    </div>
                  ))}
                </div>
                
                <button type="button" className="addgoal-add-subject" onClick={handleAddSubject}>
                  <Plus size={16} /> Add Another Subject
                </button>

                <div className="addgoal-actions">
                  <button type="button" className="addgoal-back-btn" onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button type="submit" className="addgoal-submit-btn" style={{ background: formData.gradient }}>
                    Create Goal <CheckCircle2 size={16} />
                  </button>
                </div>
              </div>
            )}
            
          </form>
        </div>
      </div>
    </div>
  );
}
