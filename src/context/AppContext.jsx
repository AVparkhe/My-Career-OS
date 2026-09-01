import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialExploreTopics, initialAchievements } from '../data/initialData';
import { getCurrentUser, logout } from '../services/authService';
import { loadAllUserData, saveUserData, logActivity, getDailyScores, saveDailyScore } from '../services/authService';
import { calculateLocalScore } from '../services/aiService';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  
  // App state
  const [goals, setGoals] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [streak, setStreak] = useState(0);
  const [dreams, setDreams] = useState([]);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [dailyScores, setDailyScores] = useState({});

  // Load user data when user changes
  useEffect(() => {
    async function fetchUserData() {
      if (currentUser) {
        try {
          const data = await loadAllUserData();
          
          setGoals(data.goals || []);
          setJournalEntries(data.journalEntries || []);
          setSchedule(data.schedule || {});
          setDreams(data.dreams || []);
          setAchievements(data.achievements || initialAchievements);
          setStreak(data.streak || 0);
          setDailyScores(data.dailyScores || {});
          
        } catch (error) {
          console.error("Failed to load user data:", error);
        }
      }
    }
    fetchUserData();
  }, [currentUser]);

  // Auth actions
  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  // State update wrappers that also persist
  const updateGoals = (newGoals) => {
    setGoals(newGoals);
    if (currentUser) saveUserData('goals', newGoals);
  };

  const updateJournal = (newEntries) => {
    setJournalEntries(newEntries);
    if (currentUser) saveUserData('journalEntries', newEntries);
  };

  const updateSchedule = (newSchedule) => {
    setSchedule(newSchedule);
    if (currentUser) saveUserData('schedule', newSchedule);
  };

  const updateStreak = (newStreak) => {
    setStreak(newStreak);
    if (currentUser) saveUserData('streak', newStreak);
  };

  const updateAchievements = (newAchievements) => {
    setAchievements(newAchievements);
    if (currentUser) saveUserData('achievements', newAchievements);
  };

  // --- Helper: auto-log today's schedule based on real activity ---
  const autoLogScheduleEntry = (subjects) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = schedule[today] || { status: 'unscheduled', subjects: [], completedSessions: 0 };
    const updatedSubjects = [...new Set([...(existing.subjects || []), ...subjects])];
    const sessions = (existing.completedSessions || 0) + 1;
    const newSchedule = {
      ...schedule,
      [today]: {
        status: sessions >= 3 ? 'completed' : 'partial',
        subjects: updatedSubjects,
        time: existing.time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        completedSessions: sessions,
      }
    };
    updateSchedule(newSchedule);
  };

  // --- Helper: Check and unlock achievements ---
  const checkAchievements = (newStreak, newGoals, newJournal) => {
    const today = new Date().toISOString().split('T')[0];
    const totalProblems = (newGoals || goals).reduce((acc, g) => 
      acc + g.subjects.reduce((a, s) => a + s.completed, 0), 0);
    const currentStreak = newStreak !== undefined ? newStreak : streak;
    const journalCount = (newJournal || journalEntries).length;

    const conditions = {
      'streak_7': currentStreak >= 7,
      'streak_30': currentStreak >= 30,
      'problems_100': totalProblems >= 100,
      'journal_10': journalCount >= 10,
      'goals_3': (newGoals || goals).length >= 3,
      'first_dream': dreams.length >= 1,
    };

    let changed = false;
    const newAchievements = achievements.map(a => {
      if (!a.unlocked && a.conditionKey && conditions[a.conditionKey]) {
        changed = true;
        window.dispatchEvent(new CustomEvent('showAchievement', { detail: a }));
        return { ...a, unlocked: true, date: today };
      }
      return a;
    });

    if (changed) {
      updateAchievements(newAchievements);
    }
  };

  // --- Helper: Calculate and store daily XP/level ---
  const getXP = () => {
    const goalXP = goals.reduce((acc, g) => 
      acc + g.subjects.reduce((a, s) => a + s.completed * 10, 0), 0);
    const journalXP = journalEntries.length * 15;
    const streakXP = streak * 5;
    const dreamXP = dreams.length * 20;
    return goalXP + journalXP + streakXP + dreamXP;
  };

  const getLevel = () => {
    const xp = getXP();
    if (xp >= 5000) return { level: 10, title: 'Legendary' };
    if (xp >= 3000) return { level: 8, title: 'Master' };
    if (xp >= 2000) return { level: 7, title: 'Expert' };
    if (xp >= 1200) return { level: 6, title: 'Advanced' };
    if (xp >= 700) return { level: 5, title: 'Explorer' };
    if (xp >= 400) return { level: 4, title: 'Builder' };
    if (xp >= 200) return { level: 3, title: 'Learner' };
    if (xp >= 50) return { level: 2, title: 'Beginner' };
    return { level: 1, title: 'Starter' };
  };

  // ========== GOAL ACTIONS ==========
  const updateGoalProgress = (goalId, subjectIndex, change) => {
    const newGoals = goals.map(g => {
      if (g.id === goalId) {
        const newSubjects = [...g.subjects];
        newSubjects[subjectIndex] = {
          ...newSubjects[subjectIndex],
          completed: Math.max(0, Math.min(newSubjects[subjectIndex].total, newSubjects[subjectIndex].completed + change))
        };
        return { ...g, subjects: newSubjects };
      }
      return g;
    });
    updateGoals(newGoals);
    
    // Auto-log schedule
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      autoLogScheduleEntry([goal.subjects[subjectIndex]?.name || 'Study']);
    }

    // Check achievements
    checkAchievements(undefined, newGoals);

    // Log & score
    if (currentUser) {
      logActivity({ type: 'goal_progress', goalId, subjectIndex, change });
      const score = calculateLocalScore({ goals: newGoals, journalEntries, streak, schedule });
      const today = new Date().toISOString().split('T')[0];
      saveDailyScore(today, score);
      getDailyScores().then(setDailyScores);
    }
  };

  const addGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      subjects: goal.subjects.map(s => ({ ...s, id: Math.random().toString(36).substr(2, 9), completed: 0 }))
    };
    const newGoals = [...goals, newGoal];
    updateGoals(newGoals);
    checkAchievements(undefined, newGoals);
    if (currentUser) {
      logActivity({ type: 'add_goal', goalId: newGoal.id });
    }
  };

  const deleteGoal = (goalId) => {
    const newGoals = goals.filter(g => g.id !== goalId);
    updateGoals(newGoals);
    if (currentUser) logActivity({ type: 'delete_goal', goalId });
  };

  const editGoal = (goalId, updates) => {
    const newGoals = goals.map(g => g.id === goalId ? { ...g, ...updates } : g);
    updateGoals(newGoals);
    if (currentUser) logActivity({ type: 'edit_goal', goalId });
  };

  // ========== JOURNAL ACTIONS ==========
  const addJournalEntry = (entry) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    const newEntries = [newEntry, ...journalEntries];
    updateJournal(newEntries);
    autoLogScheduleEntry(['Journal']);
    checkAchievements(undefined, undefined, newEntries);
    if (currentUser) {
      logActivity({ type: 'journal_entry', entryId: newEntry.id });
    }
  };

  const deleteJournalEntry = (entryId) => {
    const newEntries = journalEntries.filter(e => e.id !== entryId);
    updateJournal(newEntries);
    if (currentUser) logActivity({ type: 'delete_journal', entryId });
  };

  const editJournalEntry = (entryId, updates) => {
    const newEntries = journalEntries.map(e => e.id === entryId ? { ...e, ...updates } : e);
    updateJournal(newEntries);
    if (currentUser) logActivity({ type: 'edit_journal', entryId });
  };

  // ========== DREAM ACTIONS ==========
  const addDream = (dream) => {
    const newDream = {
      ...dream,
      id: Date.now().toString(),
      progress: 0,
      color: ['violet', 'teal', 'coral', 'yellow', 'mint', 'pink'][Math.floor(Math.random() * 6)]
    };
    const newDreams = [...dreams, newDream];
    setDreams(newDreams);
    checkAchievements();
    if (currentUser) {
      saveUserData('dreams', newDreams);
      logActivity({ type: 'add_dream', dreamId: newDream.id });
    }
  };

  const deleteDream = (dreamId) => {
    const newDreams = dreams.filter(d => d.id !== dreamId);
    setDreams(newDreams);
    if (currentUser) {
      saveUserData('dreams', newDreams);
      logActivity({ type: 'delete_dream', dreamId });
    }
  };

  const updateDreamProgress = (dreamId, progress) => {
    const newDreams = dreams.map(d => d.id === dreamId ? { ...d, progress: Math.min(100, Math.max(0, progress)) } : d);
    setDreams(newDreams);
    if (currentUser) {
      saveUserData('dreams', newDreams);
      logActivity({ type: 'update_dream_progress', dreamId, progress });
    }
  };

  const editDream = (dreamId, updates) => {
    const newDreams = dreams.map(d => d.id === dreamId ? { ...d, ...updates } : d);
    setDreams(newDreams);
    if (currentUser) {
      saveUserData('dreams', newDreams);
      logActivity({ type: 'edit_dream', dreamId });
    }
  };

  // ========== ACHIEVEMENT ACTIONS ==========
  const addAchievement = (achievement) => {
    const newAch = {
      ...achievement,
      id: Date.now().toString(),
      unlocked: false,
      date: null,
    };
    const newAchievements = [...achievements, newAch];
    updateAchievements(newAchievements);
    if (currentUser) logActivity({ type: 'add_achievement' });
  };

  const deleteAchievement = (achId) => {
    const newAchievements = achievements.filter(a => a.id !== achId);
    updateAchievements(newAchievements);
  };

  // ========== DAILY SESSION ==========
  const completeDailySession = () => {
    const today = new Date().toISOString().split('T')[0];
    const newSchedule = {
      ...schedule,
      [today]: { ...schedule[today], status: 'completed' }
    };
    updateSchedule(newSchedule);
    const newStreak = streak + 1;
    updateStreak(newStreak);
    checkAchievements(newStreak);
    
    if (currentUser) {
      logActivity({ type: 'daily_session_complete', date: today });
      const score = calculateLocalScore({ goals, journalEntries, streak: newStreak, schedule: newSchedule });
      saveDailyScore(today, score);
      getDailyScores().then(setDailyScores);
    }
  };

  // ========== CLEAR DATA ==========
  const clearData = () => {
    if (currentUser) {
      saveUserData('goals', []);
      saveUserData('journalEntries', []);
      saveUserData('dreams', []);
      saveUserData('schedule', {});
      saveUserData('streak', 0);
      saveUserData('achievements', initialAchievements);
      setGoals([]);
      setJournalEntries([]);
      setDreams([]);
      setSchedule({});
      setStreak(0);
      setAchievements(initialAchievements);
    }
  };

  const value = {
    currentUser,
    handleLogin,
    handleLogout,
    goals,
    journalEntries,
    schedule,
    streak,
    exploreTopics: initialExploreTopics,
    dreams,
    achievements,
    dailyScores,
    // Goal actions
    updateGoalProgress,
    addGoal,
    deleteGoal,
    editGoal,
    // Journal actions
    addJournalEntry,
    deleteJournalEntry,
    editJournalEntry,
    // Dream actions
    addDream,
    deleteDream,
    updateDreamProgress,
    editDream,
    // Achievement actions
    addAchievement,
    deleteAchievement,
    // Other
    completeDailySession,
    clearData,
    getXP,
    getLevel,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
