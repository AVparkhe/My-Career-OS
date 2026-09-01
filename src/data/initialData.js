// Initial data for My Career OS

export const initialGoals = [
  {
    id: 'job-prep',
    title: 'Job Preparation',
    emoji: '🎯',
    overallProgress: 0.42,
    motivationalText: 'Building momentum ✨',
    gradient: 'var(--gradient-violet-pink)',
    subjects: [
      { id: 'dsa', name: 'DSA', color: 'var(--color-violet)', completed: 28, total: 50, icon: '🧩' },
      { id: 'dbms', name: 'DBMS', color: 'var(--color-teal)', completed: 12, total: 30, icon: '🗄️' },
      { id: 'os', name: 'Operating Systems', color: 'var(--color-coral)', completed: 8, total: 25, icon: '💻' },
      { id: 'cn', name: 'Computer Networks', color: 'var(--color-yellow)', completed: 5, total: 20, icon: '🌐' },
      { id: 'sys-design', name: 'System Design', color: 'var(--color-pink)', completed: 3, total: 15, icon: '🏗️' },
    ]
  },
  {
    id: 'gate-prep',
    title: 'GATE 2027',
    emoji: '📚',
    overallProgress: 0.35,
    motivationalText: 'Every page counts 📖',
    gradient: 'var(--gradient-teal-aqua)',
    subjects: [
      { id: 'gate-math', name: 'Mathematics', color: 'var(--color-teal)', completed: 15, total: 40, icon: '📐' },
      { id: 'gate-aptitude', name: 'Aptitude', color: 'var(--color-yellow)', completed: 20, total: 30, icon: '🧠' },
      { id: 'gate-core', name: 'Core Subjects', color: 'var(--color-violet)', completed: 10, total: 50, icon: '📘' },
    ]
  },
  {
    id: 'ai-project',
    title: 'AI Project',
    emoji: '🤖',
    overallProgress: 0.25,
    motivationalText: 'Creating something amazing 🚀',
    gradient: 'var(--gradient-lavender-blue)',
    subjects: [
      { id: 'ml-basics', name: 'ML Basics', color: 'var(--color-violet)', completed: 8, total: 20, icon: '🔬' },
      { id: 'nlp', name: 'NLP', color: 'var(--color-teal)', completed: 3, total: 15, icon: '💬' },
      { id: 'deployment', name: 'Deployment', color: 'var(--color-mint)', completed: 2, total: 10, icon: '🚀' },
    ]
  }
];

export const initialJournalEntries = [
  {
    id: 1,
    date: '2026-08-28T19:30:00',
    mood: '🔥',
    energy: 'high',
    title: 'Cracked a hard graph problem!',
    content: 'Finally understood Dijkstra\'s algorithm deeply today. The key insight was thinking about it as BFS with a priority queue. Solved 3 medium-level problems after that breakthrough.',
    tags: ['dsa', 'breakthrough', 'graphs'],
    type: 'reflection',
    duration: '2h 15m',
  },
  {
    id: 2,
    date: '2026-08-27T21:00:00',
    mood: '🙂',
    energy: 'normal',
    title: 'Explored transformer architecture',
    content: 'Read the "Attention is All You Need" paper. The self-attention mechanism is fascinating. Need to implement it from scratch next.',
    tags: ['ai', 'research', 'learning'],
    type: 'learning',
    duration: '1h 30m',
  },
  {
    id: 3,
    date: '2026-08-26T08:00:00',
    mood: '😴',
    energy: 'low',
    title: 'Slow day but still showed up',
    content: 'Didn\'t feel like studying but still reviewed 10 DBMS flashcards. Small wins matter.',
    tags: ['consistency', 'dbms'],
    type: 'reflection',
    duration: '30m',
  },
  {
    id: 4,
    date: '2026-08-25T16:00:00',
    mood: '✨',
    energy: 'high',
    title: 'Launched my portfolio site!',
    content: 'Finally deployed my portfolio on Vercel. Feels amazing to see my work live. Got 3 compliments from friends already.',
    tags: ['achievement', 'portfolio', 'milestone'],
    type: 'achievement',
    duration: '4h',
  },
];

export const initialDreams = [
  {
    id: 1,
    title: 'Build my own AI product',
    description: 'Create an AI-powered tool that helps students learn better',
    why: 'Become a strong AI engineer and make education accessible',
    target: '2028',
    emoji: '✨',
    gradient: 'var(--gradient-violet-pink)',
    progress: 15,
  },
  {
    id: 2,
    title: 'Join a top tech company',
    description: 'Land a role at Google, Meta, or a top AI startup',
    why: 'Work with the best minds and solve challenging problems',
    target: '2027',
    emoji: '🚀',
    gradient: 'var(--gradient-teal-aqua)',
    progress: 35,
  },
  {
    id: 3,
    title: 'Publish a research paper',
    description: 'Contribute original research in NLP or computer vision',
    why: 'Push the boundaries of what\'s possible with AI',
    target: '2027',
    emoji: '📄',
    gradient: 'var(--gradient-lavender-blue)',
    progress: 10,
  },
  {
    id: 4,
    title: 'Become financially independent',
    description: 'Build multiple income streams and invest wisely',
    why: 'Freedom to work on what I love without financial stress',
    target: '2030',
    emoji: '💎',
    gradient: 'var(--gradient-yellow-coral)',
    progress: 20,
  },
];

export const initialAchievements = [
  { id: '1', title: '7-day streak', emoji: '🔥', date: null, color: 'coral', unlocked: false, conditionKey: 'streak_7' },
  { id: '2', title: 'Set 3 goals', emoji: '🎯', date: null, color: 'yellow', unlocked: false, conditionKey: 'goals_3' },
  { id: '3', title: 'First dream', emoji: '✨', date: null, color: 'teal', unlocked: false, conditionKey: 'first_dream' },
  { id: '4', title: '30-day consistency', emoji: '🏆', date: null, color: 'violet', unlocked: false, conditionKey: 'streak_30' },
  { id: '5', title: '100 sessions completed', emoji: '🧩', date: null, color: 'mint', unlocked: false, conditionKey: 'problems_100' },
  { id: '6', title: '10 journal entries', emoji: '📝', date: null, color: 'pink', unlocked: false, conditionKey: 'journal_10' },
];

export const initialExploreTopics = [
  { id: 1, title: 'Space', emoji: '🌌', color: 'var(--color-violet)', gradient: 'var(--gradient-lavender-blue)', description: 'Explore the cosmos and beyond', articles: 24 },
  { id: 2, title: 'Nature', emoji: '🏔️', color: 'var(--color-mint)', gradient: 'var(--gradient-mint-teal)', description: 'Wonders of the natural world', articles: 31 },
  { id: 3, title: 'Psychology', emoji: '🧠', color: 'var(--color-pink)', gradient: 'var(--gradient-pink-peach)', description: 'Understanding the human mind', articles: 18 },
  { id: 4, title: 'History', emoji: '🏛️', color: 'var(--color-yellow)', gradient: 'var(--gradient-yellow-coral)', description: 'Stories that shaped our world', articles: 27 },
  { id: 5, title: 'Science', emoji: '🧬', color: 'var(--color-teal)', gradient: 'var(--gradient-teal-aqua)', description: 'Discoveries and breakthroughs', articles: 22 },
  { id: 6, title: 'Art', emoji: '🎨', color: 'var(--color-coral)', gradient: 'var(--gradient-pink-peach)', description: 'Creative expression and beauty', articles: 15 },
  { id: 7, title: 'Culture', emoji: '🌍', color: 'var(--color-violet)', gradient: 'var(--gradient-violet-pink)', description: 'Diverse traditions and customs', articles: 20 },
  { id: 8, title: 'Ideas', emoji: '💡', color: 'var(--color-yellow)', gradient: 'var(--gradient-yellow-coral)', description: 'Thought-provoking concepts', articles: 19 },
];

export const initialSchedule = (() => {
  const schedule = {};
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().split('T')[0];
    const rand = Math.random();
    if (rand > 0.75) {
      schedule[key] = { status: 'completed', subjects: ['DSA', 'DBMS'], time: '07:32 AM', duration: '1h 24m' };
    } else if (rand > 0.5) {
      schedule[key] = { status: 'partial', subjects: ['DSA'], time: '09:15 AM', duration: '45m' };
    } else if (rand > 0.25) {
      schedule[key] = { status: 'missed', subjects: [], time: null, duration: null };
    } else {
      schedule[key] = { status: 'unscheduled', subjects: [], time: null, duration: null };
    }
  }
  // Make today completed
  schedule[today.toISOString().split('T')[0]] = { status: 'completed', subjects: ['DSA', 'OS'], time: '07:32 AM', duration: '2h 10m' };
  return schedule;
})();
