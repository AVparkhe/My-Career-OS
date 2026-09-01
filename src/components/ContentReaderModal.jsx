import React, { useState, useEffect } from 'react';
import { X, BookOpen, Sparkles, Share2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../context/AppContext';
import { generateArticleContent } from '../services/aiService';
import { getAIApiKey } from '../services/authService';
import './ContentReaderModal.css';

export default function ContentReaderModal() {
  const context = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOpen = async (e) => {
      const { topic, description } = e.detail;
      setTitle(topic);
      setIsOpen(true);
      setLoading(true);
      setError(null);
      setContent('');

      const apiKey = getAIApiKey();
      if (!apiKey) {
        setLoading(false);
        setError('Please add your Gemini API key in the Profile section to generate articles.');
        return;
      }

      try {
        // Check cache first
        const cacheKey = `article_${topic.replace(/\s+/g, '_')}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setContent(cached);
          setLoading(false);
          return;
        }

        const articleMd = await generateArticleContent(topic, description || '', context);
        setContent(articleMd);
        localStorage.setItem(cacheKey, articleMd); // Cache for future clicks
      } catch (err) {
        console.error(err);
        
        // Graceful fallback content if AI fails
        const fallbackMd = `
# 🌟 AI is currently resting

*Google AI Rate Limit Exceeded.* While the AI takes a quick 60-second break, here is a curated tip for your career journey:

## The Power of Systems over Goals

Goals are about the results you want to achieve. **Systems are about the processes that lead to those results.**

- **Goals:** "I want to get a job at a FAANG company."
- **Systems:** "I will solve 2 DSA problems every morning and read 1 system design chapter before bed."

If you completely ignored your goals and focused only on your system, would you still succeed? Often, the answer is yes. Use this time to refine your daily systems in the **Goals** tab!
        `;
        
        setContent(fallbackMd.trim());
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener('openContentReader', handleOpen);
    return () => window.removeEventListener('openContentReader', handleOpen);
  }, [context]);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(title + '\\n\\n' + content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="reader-overlay animate-fade-in" onClick={() => setIsOpen(false)}>
      <div className="reader-modal animate-scale-up" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="reader-header">
          <div className="reader-header__left">
            <div className="reader-icon-wrapper">
              <BookOpen size={20} color="white" />
            </div>
            <h2 className="reader-title">{title}</h2>
          </div>
          <div className="reader-header__actions">
            <button className="reader-action-btn" onClick={handleCopy} title="Copy to clipboard">
              {copied ? <Check size={18} className="text-mint" /> : <Copy size={18} />}
            </button>
            <button className="reader-close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="reader-content-area">
          {loading ? (
            <div className="reader-loading">
              <div className="reader-loading__orb">
                <Sparkles size={24} className="animate-spin-slow" />
              </div>
              <h3>Generating Personalized Insights...</h3>
              <p>Tailoring this topic to your career goals.</p>
              
              <div className="skeleton-wrapper">
                <div className="skeleton-line w-3/4"></div>
                <div className="skeleton-line w-full"></div>
                <div className="skeleton-line w-5/6"></div>
                <div className="skeleton-line w-full mt-4"></div>
                <div className="skeleton-line w-2/3"></div>
              </div>
            </div>
          ) : error ? (
            <div className="reader-error">
              <p>{error}</p>
            </div>
          ) : (
            <div className="reader-markdown">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && (
          <div className="reader-footer">
            <p className="reader-footer__credits">Generated by Career OS AI ✨</p>
          </div>
        )}

      </div>
    </div>
  );
}
