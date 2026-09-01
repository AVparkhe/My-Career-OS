import React, { useState, useEffect } from 'react';
import { LineChart as LineChartIcon, Activity, TrendingUp, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import { analyzeProgress, calculateLocalScore, getLocalMentorMessage } from '../services/aiService';
import { getAIApiKey } from '../services/authService';
import './AnalyticsPage.css';

export default function AnalyticsPage() {
  const { goals, journalEntries, streak, schedule, dreams, dailyScores, currentUser } = useApp();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const fetchAnalysis = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    const apiKey = getAIApiKey();
    const userData = {
      goals,
      journalEntries,
      streak,
      schedule,
      dreams,
      dailyScores,
      profile: currentUser,
    };
    
    try {
      if (apiKey) {
        // Check cache first
        const cacheKey = `analytics_cache_${currentUser?.id || 'default'}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (!forceRefresh && cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Cache valid for 12 hours
          if (Date.now() - timestamp < 12 * 60 * 60 * 1000) {
            setAnalysis(data);
            setLoading(false);
            return;
          }
        }

        const result = await analyzeProgress(userData);
        setAnalysis(result);
        
        // Save to cache
        localStorage.setItem(cacheKey, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      } else {
        const score = calculateLocalScore(userData);
        const mentor = getLocalMentorMessage(score, currentUser?.name || 'User');
        
        setAnalysis({
          overallScore: score,
          scoreLabel: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Improvement' : 'Critical',
          summary: "This is a local estimation based on your streak and goal completion. Add your Gemini API key in Profile settings for a deep, AI-powered analysis.",
          strengths: ["Consistency in tracking", "Setting clear goals"],
          weaknesses: ["Add an API key for detailed insights"],
          suggestions: [
            { title: "Connect AI", description: "Add your Gemini API key in Profile to unlock full mentor capabilities.", priority: "high" }
          ],
          weeklyTrend: "stable",
          focusAreas: ["Consistency"],
          mentorMessage: mentor.message,
          mentorTone: mentor.tone,
          progressData: [
            { category: "Goals", score: 65, trend: "up" },
            { category: "Consistency", score: Math.min(streak * 5, 100), trend: "up" }
          ]
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [streak, goals.length, journalEntries.length]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--color-mint)';
    if (score >= 60) return 'var(--color-teal)';
    if (score >= 40) return 'var(--color-yellow)';
    return 'var(--color-coral)';
  };

  const getToneIcon = (tone) => {
    switch (tone) {
      case 'proud': return '🌟';
      case 'supportive': return '💪';
      case 'concerned': return '👀';
      case 'stern': return '🔥';
      default: return '🤖';
    }
  };

  const chartData = Object.keys(dailyScores || {})
    .sort()
    .slice(-14) // Last 14 days
    .map(date => ({
      date: date.substring(5), // MM-DD
      score: dailyScores[date]
    }));

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">
            <LineChartIcon size={28} />
            Progress & AI Mentor
          </h1>
          <p className="analytics-subtitle">Your personalized growth analysis</p>
        </div>
        <button className="analytics-refresh-btn" onClick={fetchAnalysis} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'icon-spin' : ''} />
          {loading ? 'Analyzing...' : 'Refresh Analysis'}
        </button>
      </div>

      {loading ? (
        <div className="analytics-loading">
          <div className="analytics-loading__orb" />
          <p>AI is analyzing your progress...</p>
        </div>
      ) : error ? (
        <div className="analytics-error">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      ) : analysis ? (
        <div className="analytics-content animate-fade-in-up">
          
          {/* Top Overview */}
          <div className="analytics-overview">
            <div className="analytics-score-card">
              <div className="analytics-score-ring" style={{ '--score-color': getScoreColor(analysis.overallScore), '--score-pct': `${analysis.overallScore}%` }}>
                <span className="analytics-score-val">{analysis.overallScore}</span>
              </div>
              <div className="analytics-score-info">
                <h3>{analysis.scoreLabel}</h3>
                <p>Overall Progress Score</p>
              </div>
            </div>
            
            <div className={`analytics-mentor-message analytics-mentor-message--${analysis.mentorTone}`}>
              <div className="analytics-mentor-header">
                <span className="analytics-mentor-icon">{getToneIcon(analysis.mentorTone)}</span>
                <h3>Mentor's Note</h3>
              </div>
              <p>{analysis.mentorMessage}</p>
            </div>
          </div>

          {/* Chart Section */}
          {chartData.length > 0 && (
            <div className="analytics-chart-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="analytics-card__header">
                <TrendingUp size={20} />
                <h3>Progress Over Time (Last 14 Days)</h3>
              </div>
              <div className="analytics-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                    <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--color-mint)' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="var(--color-mint)" strokeWidth={3} dot={{ fill: 'var(--color-mint)', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="analytics-grid animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Summary */}
            <div className="analytics-card analytics-card--span">
              <div className="analytics-card__header">
                <Activity size={20} />
                <h3>Analysis Summary</h3>
              </div>
              <p className="analytics-summary-text">{analysis.summary}</p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="analytics-card">
              <div className="analytics-card__header">
                <Sparkles size={20} color="var(--color-mint)" />
                <h3>Strengths</h3>
              </div>
              <ul className="analytics-list analytics-list--positive">
                {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            <div className="analytics-card">
              <div className="analytics-card__header">
                <AlertCircle size={20} color="var(--color-coral)" />
                <h3>Areas for Improvement</h3>
              </div>
              <ul className="analytics-list analytics-list--negative">
                {analysis.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            {/* Actionable Suggestions */}
            <div className="analytics-card analytics-card--span">
              <div className="analytics-card__header">
                <TrendingUp size={20} />
                <h3>Action Plan</h3>
              </div>
              <div className="analytics-suggestions">
                {analysis.suggestions.map((s, i) => (
                  <div key={i} className={`analytics-suggestion analytics-suggestion--${s.priority}`}>
                    <div className="analytics-suggestion__badge">{s.priority}</div>
                    <div className="analytics-suggestion__content">
                      <h4>{s.title}</h4>
                      <p>{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
