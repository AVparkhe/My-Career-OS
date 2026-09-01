import React, { useState, useEffect } from 'react';
import { Compass, BookOpen, ExternalLink, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateExploreContent, generateDailyFact } from '../services/aiService';
import { getAIApiKey } from '../services/authService';
import './ExplorePage.css';

// Fallback data
const fallbackFeatured = {
  title: 'The Hidden Mathematics Behind Music',
  category: 'Ideas',
  readTime: '8 min read',
  summary: 'Discover how Fibonacci sequences, fractals, and complex mathematical patterns create the music we love. From Bach to Björk, the numbers behind the notes.',
};

const fallbackTopics = [
  { id: '1', title: 'Psychology', description: 'How memories form during sleep', emoji: '🧠', articles: 24, color: 'pink' },
  { id: '2', title: 'Space', description: 'The largest known structure in the universe', emoji: '🌌', articles: 12, color: 'violet' },
  { id: '3', title: 'History', description: 'Why ancient Rome fell: A modern perspective', emoji: '🏛️', articles: 31, color: 'yellow' },
  { id: '4', title: 'Culture', description: 'The art of doing nothing: Niksen explained', emoji: '🌍', articles: 18, color: 'teal' },
  { id: '5', title: 'Science', description: 'CRISPR: Editing the code of life', emoji: '🧬', articles: 45, color: 'mint' },
];

export default function ExplorePage() {
  const { currentUser, goals } = useApp();
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState(fallbackFeatured);
  const [topics, setTopics] = useState(fallbackTopics);
  const [dailyFact, setDailyFact] = useState("Octopuses have three hearts, nine brains, and blue blood. Two hearts pump blood to the gills, while the third pumps it to the rest of the body.");
  const [error, setError] = useState(null);

  const colorMap = {
    coral: 'var(--color-coral)',
    yellow: 'var(--color-yellow)',
    teal: 'var(--color-teal)',
    violet: 'var(--color-violet)',
    mint: 'var(--color-mint)',
    pink: 'var(--color-pink)',
  };

  const gradientMap = {
    coral: 'var(--gradient-yellow-coral)',
    yellow: 'var(--gradient-yellow-coral)',
    teal: 'var(--gradient-teal-aqua)',
    violet: 'var(--gradient-violet-pink)',
    mint: 'var(--gradient-mint-teal)',
    pink: 'var(--gradient-pink-peach)',
  };

  const fetchContent = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    const apiKey = getAIApiKey();

    if (!apiKey) {
      // Use fallbacks
      setFeatured(fallbackFeatured);
      setTopics(fallbackTopics);
      setError("Add your Gemini API key in Profile to get personalized AI content.");
      setLoading(false);
      return;
    }

    try {
      // Check cache first
      const cacheKey = `explore_cache_${currentUser?.careerGoal || 'default'}`;
      const cached = localStorage.getItem(cacheKey);
      if (!forceRefresh && cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache valid for 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setFeatured(data.exploreData?.featured || fallbackFeatured);
          setTopics(data.exploreData?.topics || fallbackTopics);
          if (data.fact) setDailyFact(data.fact);
          setLoading(false);
          return;
        }
      }

      const careerGoal = currentUser?.careerGoal || 'Career Growth';
      const interests = goals.map(g => g.title).join(', ');
      
      const [exploreData, fact] = await Promise.all([
        generateExploreContent(careerGoal, interests),
        generateDailyFact(careerGoal)
      ]);

      if (exploreData) {
        setFeatured(exploreData.featured || fallbackFeatured);
        setTopics(exploreData.topics || fallbackTopics);
      }
      if (fact) {
        setDailyFact(fact);
      }

      // Save to cache
      localStorage.setItem(cacheKey, JSON.stringify({
        data: { exploreData, fact },
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to generate personalized content. Showing default topics.");
      setFeatured(fallbackFeatured);
      setTopics(fallbackTopics);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [currentUser?.careerGoal]);

  const featuredGradient = gradientMap['violet']; // Default to violet for featured

  return (
    <div className="explore-page">
      <div className="explore-header">
        <div>
          <h1 className="explore-title">
            <Compass size={28} />
            Explore
          </h1>
          <p className="explore-subtitle">Personalized learning feed based on your career goals 🌎</p>
        </div>
        <button className="explore-refresh-btn" onClick={fetchContent} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'icon-spin' : ''} />
          {loading ? 'Curating...' : 'Refresh Feed'}
        </button>
      </div>

      {error && (
        <div className="explore-error">
          <p>{error}</p>
        </div>
      )}

      {/* Featured */}
      <div className="explore-featured animate-fade-in-up" style={{ '--featured-gradient': featuredGradient }}>
        <div className="explore-featured__bg" />
        <div className="explore-featured__content">
          <span className="explore-featured__badge">✨ {featured.category}</span>
          <h2 className="explore-featured__title">{featured.title}</h2>
          <p className="explore-featured__desc">{featured.summary}</p>
          <div className="explore-featured__meta">
            <span>{featured.readTime}</span>
            <button 
              className="explore-featured__btn"
              onClick={() => {
                const event = new CustomEvent('openContentReader', { detail: { topic: featured.title, description: featured.summary }});
                window.dispatchEvent(event);
              }}
            >
              <BookOpen size={16} />
              Read Now
            </button>
          </div>
        </div>
      </div>

      {/* Categories / Topics */}
      <section>
        <h2 className="explore-section-title">Curated Topics for You</h2>
        <div className="explore-categories">
          {topics.map((topic, i) => {
            const topicColor = colorMap[topic.color] || colorMap.violet;
            const topicGradient = gradientMap[topic.color] || gradientMap.violet;
            return (
              <div
                key={topic.id || i}
                className="explore-category-card animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s`, '--cat-gradient': topicGradient, '--cat-color': topicColor }}
                onClick={() => {
                  const event = new CustomEvent('openContentReader', { detail: { topic: topic.title, description: topic.description }});
                  window.dispatchEvent(event);
                }}
              >
                <div className="explore-category-card__icon">
                  <span>{topic.emoji}</span>
                </div>
                <h3 className="explore-category-card__title">{topic.title}</h3>
                <p className="explore-category-card__desc">{topic.description}</p>
                <div className="explore-category-card__footer">
                   <span className="explore-category-card__count">{topic.articles} articles</span>
                   <ExternalLink size={14} className="explore-category-card__link-icon" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Daily Discovery */}
      <section className="explore-daily animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="explore-daily__header">
          <h2 className="explore-section-title">🌟 Daily Discovery</h2>
          <span className="explore-daily__tag">AI Generated Fact</span>
        </div>
        <div className="explore-daily__card">
          <div className="explore-daily__card-bg" />
          <p className="explore-daily__fact">
            "{dailyFact}"
          </p>
          <span className="explore-daily__source">— Career OS AI 🤖</span>
        </div>
      </section>
    </div>
  );
}
