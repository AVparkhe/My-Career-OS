import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Target, Sparkles, Compass, PenTool, Trophy, Zap, Bot, LineChart, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Sidebar.css';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/dreams', icon: Sparkles, label: 'Dreams' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/journal', icon: PenTool, label: 'Journal' },
  { path: '/achievements', icon: Trophy, label: 'Achievements' },
  { path: '/analytics', icon: LineChart, label: 'Analytics' },
];

export default function Sidebar() {
  const { currentUser } = useApp();

  const handleFreeNowClick = () => {
    window.dispatchEvent(new CustomEvent('openFreeNowModal'));
  };

  const handleAICoachClick = () => {
    window.dispatchEvent(new CustomEvent('openAICoach'));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-orb">
            <Sparkles size={16} />
          </div>
          <span>Career OS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-free-now animate-breathe" onClick={handleFreeNowClick}>
          <Zap size={16} />
          I'm Free! ✨
        </button>
        <button className="btn-ai-coach" onClick={handleAICoachClick}>
          <Bot size={16} />
          AI Coach
        </button>
        
        <NavLink to="/profile" className={({ isActive }) => `sidebar-profile ${isActive ? 'active' : ''}`}>
          <div className="sidebar-profile__avatar">
            {currentUser?.avatar || <User size={16} />}
          </div>
          <div className="sidebar-profile__info">
            <span className="sidebar-profile__name">{currentUser?.name || 'My Profile'}</span>
            <span className="sidebar-profile__role">Settings</span>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
