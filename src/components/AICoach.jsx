import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Send, Bot, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { chatWithCoach } from '../services/aiService';
import { getAIApiKey } from '../services/authService';
import './AICoach.css';

export default function AICoach() {
  const context = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: "Hey! 👋 I'm your Career Coach. I've been looking at your progress and I have some thoughts. What would you like to talk about?", time: 'Just now' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openAICoach', handleOpen);
    return () => window.removeEventListener('openAICoach', handleOpen);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), type: 'user', text: input, time: 'Just now' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const apiKey = getAIApiKey();

    try {
      if (apiKey) {
        // Real Gemini AI Chat
        const responseText = await chatWithCoach(userMsg.text, context);
        setMessages(prev => [...prev, { id: Date.now(), type: 'ai', text: responseText, time: 'Just now' }]);
      } else {
        // Mock fallback if no API key
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: Date.now(), 
            type: 'ai', 
            text: "That's a great thought! (Add your Gemini API key in Profile to enable real AI chat).", 
            time: 'Just now' 
          }]);
          setIsTyping(false);
        }, 1500);
        return; // Early return for mock
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), type: 'ai', text: "Sorry, I had trouble connecting to the network.", time: 'Just now' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="coach-overlay" onClick={() => setIsOpen(false)}>
      <div className="coach-panel animate-slide-in-right" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="coach-header">
          <div className="coach-header__left">
            <div className={`coach-orb ${isTyping ? 'coach-orb--thinking' : ''}`}>
              <div className="coach-orb__ring"></div>
              <div className="coach-orb__ring coach-orb__ring--2"></div>
              <Bot size={20} style={{ position: 'relative', zIndex: 2 }} />
            </div>
            <div>
              <h2 className="coach-header__title">AI Coach</h2>
              <span className="coach-header__status">
                <span className="status-dot" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-mint)', marginRight: '6px' }} />
                {isTyping ? 'Thinking...' : 'Online • Ready to help'}
              </span>
            </div>
          </div>
          <button className="coach-close" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="coach-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`coach-msg coach-msg--${msg.type}`}>
              {msg.type === 'ai' && (
                <div className="coach-msg__avatar">
                  <Sparkles size={14} />
                </div>
              )}
              <div className="coach-msg__bubble">
                <p>{msg.text}</p>
                <span className="coach-msg__time">{msg.time}</span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="coach-msg coach-msg--ai">
              <div className="coach-msg__avatar">
                <Sparkles size={14} />
              </div>
              <div className="coach-msg__bubble coach-msg__typing">
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div>
          <div className="coach-quick">
            <button className="coach-quick__btn" onClick={() => setInput('What should I study today?')}>What should I study today?</button>
            <button className="coach-quick__btn" onClick={() => setInput('Review my progress')}>Review my progress</button>
            <button className="coach-quick__btn" onClick={() => setInput('Motivate me!')}>Motivate me!</button>
          </div>
          
          <div className="coach-input">
            <button className="coach-mic">
              <Mic size={18} />
            </button>
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="coach-send" onClick={handleSend} disabled={!input.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
