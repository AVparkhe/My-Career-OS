// Gemini AI Service for Career OS
// Provides AI analysis, scoring, mentoring, and suggestions

import { getAIApiKey } from './authService';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

// Helper to robustly extract and parse JSON from Gemini's response
function extractAndParseJSON(response) {
  try {
    let jsonStr = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const match = jsonStr.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      jsonStr = match[0];
    }
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON:", response);
    throw new Error("Could not parse AI response into JSON");
  }
}

async function callGemini(prompt) {
  const apiKey = getAIApiKey();
  if (!apiKey) {
    throw new Error('AI API key not configured. Please add your Gemini API key in Profile settings.');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI request failed: ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
}

// --- Analyze user progress and generate score ---
export async function analyzeProgress(userData) {
  const { goals, journalEntries, streak, dailyScores, schedule, dreams, profile } = userData;
  
  const prompt = `You are a career mentor AI for a personal career growth app called "Career OS". Analyze the following user data and provide a detailed analysis.

USER PROFILE:
Name: ${profile?.name || 'User'}
Career Goal: ${profile?.careerGoal || 'Not specified'}
Role/Title: ${profile?.role || 'Not specified'}

GOALS & PROGRESS:
${goals.map(g => {
  const totalCompleted = g.subjects.reduce((a, s) => a + s.completed, 0);
  const totalItems = g.subjects.reduce((a, s) => a + s.total, 0);
  const pct = Math.round((totalCompleted / totalItems) * 100);
  return `- ${g.title} (${pct}% complete): ${g.subjects.map(s => `${s.name}: ${s.completed}/${s.total}`).join(', ')}`;
}).join('\n')}

CURRENT STREAK: ${streak} days

RECENT SCHEDULE (last 7 days):
${Object.entries(schedule).slice(-7).map(([date, data]) => `${date}: ${data.status}${data.subjects?.length ? ' (' + data.subjects.join(', ') + ')' : ''}`).join('\n')}

RECENT JOURNAL ENTRIES:
${journalEntries.slice(0, 5).map(e => `- [${e.mood}] ${e.title}: ${e.content.substring(0, 100)}`).join('\n')}

DREAMS:
${dreams.map(d => `- ${d.title} (Target: ${d.target}, Progress: ${d.progress}%)`).join('\n')}

Please respond ONLY with a valid JSON object (no markdown, no code fences, no extra text) with this exact structure:
{
  "overallScore": <number 0-100>,
  "scoreLabel": "<string: Excellent/Good/Average/Needs Improvement/Critical>",
  "summary": "<string: 2-3 sentence summary of overall performance>",
  "strengths": ["<string>", "<string>", "<string>"],
  "weaknesses": ["<string>", "<string>", "<string>"],
  "suggestions": [
    {"title": "<string>", "description": "<string>", "priority": "<high/medium/low>"},
    {"title": "<string>", "description": "<string>", "priority": "<high/medium/low>"},
    {"title": "<string>", "description": "<string>", "priority": "<high/medium/low>"}
  ],
  "weeklyTrend": "<improving/stable/declining>",
  "focusAreas": ["<string>", "<string>"],
  "mentorMessage": "<string: If score >= 70, give a warm compliment and encouragement. If score 40-69, give honest but supportive feedback with motivation. If score < 40, give a strict reality check, uncomfortable truth, and tough love like a real mentor who cares deeply. Be specific about what needs to change.>",
  "mentorTone": "<proud/supportive/concerned/stern>",
  "progressData": [
    {"category": "<string>", "score": <number 0-100>, "trend": "<up/down/stable>"}
  ]
}`;

  try {
    const response = await callGemini(prompt);
    return extractAndParseJSON(response);
  } catch (error) {
    console.error('AI Analysis error:', error);
    throw error;
  }
}

// --- Chat with AI Coach ---
export async function chatWithCoach(message, context) {
  const { goals, journalEntries, streak, profile } = context;
  
  const prompt = `You are a friendly, warm, and intelligent AI Career Coach in a personal career growth app called "Career OS". Your name is "Coach". 

You are talking to ${profile?.name || 'the user'} who is working towards: ${profile?.careerGoal || 'their career goals'}.

Their current streak is ${streak} days. They have ${goals?.length || 0} active goals.

Recent activities: ${journalEntries?.slice(0, 3).map(e => e.title).join(', ') || 'None yet'}.

The user says: "${message}"

Respond naturally like a caring mentor. Be concise (2-4 sentences max). Use emojis sparingly but warmly. Give specific, actionable advice when relevant. If they seem tired, be gentle. If they're motivated, match their energy. Always be honest but kind.`;

  return await callGemini(prompt);
}

// --- Generate "I'm Free Now" suggestions ---
export async function generateFreeSuggestions(preferences, context) {
  const { time, energy, activity } = preferences;
  const { goals, profile } = context;
  
  const prompt = `You are an AI Career Coach. The user has ${time} minutes, ${energy} energy, and wants to "${activity}".

Their goals: ${goals?.map(g => g.title).join(', ') || 'Not set'}.
Career goal: ${profile?.careerGoal || 'Not specified'}.

Suggest exactly 3 specific activities. Respond ONLY with a valid JSON array (no markdown, no code fences):
[
  {"title": "<specific activity>", "category": "<category>", "duration": "<X min>", "emoji": "<relevant emoji>", "description": "<why this helps>"},
  {"title": "<specific activity>", "category": "<category>", "duration": "<X min>", "emoji": "<relevant emoji>", "description": "<why this helps>"},
  {"title": "<specific activity>", "category": "<category>", "duration": "<X min>", "emoji": "<relevant emoji>", "description": "<why this helps>"}
]`;

  try {
    const response = await callGemini(prompt);
    return extractAndParseJSON(response);
  } catch (error) {
    console.error('Free suggestions error:', error);
    // Return fallback
    return [
      { title: 'Review your latest topic', category: 'Learning', duration: `${time} min`, emoji: '📚', description: 'Quick revision session' },
      { title: 'Practice coding problems', category: 'DSA', duration: `${time} min`, emoji: '🧩', description: 'Sharpen your skills' },
      { title: 'Journal your thoughts', category: 'Reflection', duration: `${time} min`, emoji: '💭', description: 'Self-reflection time' },
    ];
  }
}

// --- Generate Explore Content ---
export async function generateExploreContent(careerGoal, interests) {
  const prompt = `You are a career curator for an app called "Career OS". The user's career goal is: "${careerGoal || 'General Tech Career'}".
Their interests might include: ${interests || 'Productivity, Learning, Technology'}.

Generate exactly 5 trending topic categories related to their goals. For each category, provide a title, an emoji, a short description, the number of relevant "articles" (a random number between 12 and 45), and a color scheme (one of: coral, yellow, teal, violet, mint, pink).

Also, generate a "Featured Article" with a catchy title, a short 2-sentence summary, a read time (e.g., "5 min read"), and a category.

Respond ONLY with a valid JSON object matching this structure (no markdown, no code fences):
{
  "featured": {
    "title": "<title>",
    "summary": "<summary>",
    "readTime": "<read time>",
    "category": "<category tag>"
  },
  "topics": [
    {
      "id": "1",
      "title": "<topic title>",
      "description": "<short description>",
      "emoji": "<emoji>",
      "articles": <number>,
      "color": "<color enum>"
    }
  ]
}`;

  try {
    const response = await callGemini(prompt);
    return extractAndParseJSON(response);
  } catch (error) {
    console.error('Explore content generation error:', error);
    return null; // Return null so the UI can handle the fallback
  }
}

// --- Generate Daily Discovery Fact ---
export async function generateDailyFact(careerGoal) {
  const prompt = `Generate a single, fascinating "Daily Discovery" fact related to: ${careerGoal || 'productivity and learning'}. 
It should be surprising, inspiring, or insightful. Keep it under 2 sentences. 
Do not wrap it in quotes. Just return the text.`;
  
  try {
    const response = await callGemini(prompt);
    return response.trim();
  } catch (error) {
    return "The term 'bug' was popularized by Grace Hopper in 1947 when an actual moth was found stuck in a relay of the Mark II computer.";
  }
}

// --- Daily score generation (can run without API if needed) ---
export function calculateLocalScore(userData) {
  const { goals, journalEntries, streak, schedule } = userData;
  let score = 50; // Base score
  
  // Streak bonus (up to +15)
  score += Math.min(streak * 1.25, 15);
  
  // Goal progress bonus (up to +20)
  const avgProgress = goals.reduce((acc, g) => {
    const completed = g.subjects.reduce((a, s) => a + s.completed, 0);
    const total = g.subjects.reduce((a, s) => a + s.total, 0);
    return acc + (completed / total);
  }, 0) / Math.max(goals.length, 1);
  score += avgProgress * 20;
  
  // Recent activity bonus (up to +10)
  const today = new Date().toISOString().split('T')[0];
  const todayData = schedule[today];
  if (todayData?.status === 'completed') score += 10;
  else if (todayData?.status === 'partial') score += 5;
  else if (todayData?.status === 'missed') score -= 5;
  
  // Journal consistency bonus (up to +5)
  const recentEntries = journalEntries.filter(e => {
    const diff = (Date.now() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  score += Math.min(recentEntries.length * 1.5, 5);
  
  return Math.round(Math.max(0, Math.min(100, score)));
}

// --- Get mentor message based on score ---
export function getLocalMentorMessage(score, name) {
  if (score >= 80) {
    return {
      message: `Outstanding work, ${name}! 🌟 Your consistency and dedication are truly impressive. You're not just studying — you're building habits that will define your career. Keep this momentum, you're on the path to something great!`,
      tone: 'proud',
    };
  } else if (score >= 60) {
    return {
      message: `Good progress, ${name}! You're showing up and putting in the work. 💪 But I know you can do even better. Focus on the areas where you're falling behind and push yourself a little harder. The difference between good and great is consistency.`,
      tone: 'supportive',
    };
  } else if (score >= 40) {
    return {
      message: `${name}, let's be honest — you're capable of much more than this. 🎯 Your current effort level won't get you to your dreams. I'm not saying this to be harsh, but because I genuinely believe in your potential. What's holding you back? Let's figure it out and fix it.`,
      tone: 'concerned',
    };
  } else {
    return {
      message: `${name}, we need to talk. 🔥 Here's the uncomfortable truth: at this pace, you're falling further behind every day. Your goals aren't going to wait for you. The gap between where you are and where you want to be is growing. Stop making excuses, stop scrolling, and start showing up. You said you wanted this — prove it. Today.`,
      tone: 'stern',
    };
  }
}

// --- Generate Full Article/Content ---
export async function generateArticleContent(topicTitle, topicContext, userContext) {
  const { careerGoal, goals } = userContext;
  
  const prompt = `You are a world-class educational writer and career coach.
Write a highly engaging, insightful, and concise article (about 300-600 words) about: "${topicTitle}".
Additional Context for this topic: "${topicContext}".

The user's overall career goal is: "${careerGoal || 'Career Growth'}".
Their current active goals include: "${goals ? goals.map(g => g.title).join(', ') : 'Learning and improving'}".

CRITICAL INSTRUCTIONS:
1. Tailor the content so it is relevant to the user's career goals and interests. For example, if they are studying DSA, include concepts, interesting facts, or even a relevant clever joke.
2. Structure the content beautifully using Markdown. Use H2/H3 for sections, bullet points, bold text for emphasis, and blockquotes for key takeaways.
3. Keep it punchy and highly readable—optimized for a quick 3-5 minute reading session.
4. Do NOT output a JSON object. Output ONLY the raw Markdown text. Do NOT wrap the entire response in a markdown code block (\`\`\`markdown).`;

  try {
    const response = await callGemini(prompt);
    // Strip markdown code block wrapper if AI accidentally included it
    let mdStr = response.replace(/^```markdown\n?/i, '').replace(/```$/i, '').trim();
    return mdStr;
  } catch (error) {
    console.error('Article generation error:', error);
    throw new Error('Failed to generate article content.');
  }
}
