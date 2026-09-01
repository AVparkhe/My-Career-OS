import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import AICoach from './components/AICoach';
import FreeNowModal from './components/FreeNowModal';
import ContentReaderModal from './components/ContentReaderModal';
import AchievementPopup from './components/AchievementPopup';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import GoalsPage from './pages/GoalsPage';
import DreamsPage from './pages/DreamsPage';
import ExplorePage from './pages/ExplorePage';
import JournalPage from './pages/JournalPage';
import AchievementsPage from './pages/AchievementsPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import './App.css';

const bgVariants = {
  '/': 'app-bg--home',
  '/goals': 'app-bg--goals',
  '/dreams': 'app-bg--dreams',
  '/explore': 'app-bg--explore',
  '/journal': 'app-bg--journal',
  '/achievements': 'app-bg--achievements',
  '/profile': 'app-bg--profile',
  '/analytics': 'app-bg--analytics',
};

export default function App() {
  const { currentUser } = useApp();
  const location = useLocation();
  const bgClass = bgVariants[location.pathname] || 'app-bg--home';

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className={`app ${bgClass}`}>
      {/* Background blobs */}
      <div className="bg-blobs">
        <div className="bg-blob bg-blob--violet" />
        <div className="bg-blob bg-blob--pink" />
        <div className="bg-blob bg-blob--teal" />
        <div className="bg-blob bg-blob--yellow" />
      </div>

      <Sidebar />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/dreams" element={<DreamsPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Global overlays */}
      <AICoach />
      <FreeNowModal />
      <ContentReaderModal />
      <AchievementPopup />
    </div>
  );
}
