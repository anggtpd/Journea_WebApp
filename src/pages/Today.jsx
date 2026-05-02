import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PROMPTS, MOOD_EMOJIS, GROUNDING } from '../lib/constants';
import { callAzureAI } from '../lib/azureAi';
import { calculateStreak } from '../lib/utils';

export default function Today() {
  const { state, updateState } = useAppContext();
  const [prompts, setPrompts] = useState([]);
  const [groundingIdx, setGroundingIdx] = useState(0);
  const [customGrounding, setCustomGrounding] = useState('');
  const [isGeneratingGrounding, setIsGeneratingGrounding] = useState(false);

  const [isRefreshingPrompts, setIsRefreshingPrompts] = useState(false);

  useEffect(() => {
    const mood = state.mood || 'default';
    const pool = PROMPTS[mood] || PROMPTS.default;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setPrompts([shuffled[0]]); // Only take one
    setGroundingIdx(Math.floor(Math.random() * GROUNDING.length));
  }, [state.mood]);

  const recentEntries = [...state.entries].sort((a, b) => b.date - a.date).slice(0, 3);

  const handlePromptClick = (p) => {
    updateState({ currentPrompt: p, page: 'new-entry' });
  };

  const handlePromptsRefresh = async () => {
    setIsRefreshingPrompts(true);
    const mood = state.mood || 'default';
    const messages = [
      { role: 'user', content: `Generate exactly 1 short, deeply thoughtful journaling prompt (maximum 15 words) for someone who is currently feeling ${mood}. The prompt should be gentle and specifically helpful for overthinkers. Return ONLY the prompt text, no quotes.` }
    ];
    try {
      const response = await callAzureAI(messages);
      const newPrompt = response.trim().replace(/^["']|["']$/g, '');
      if (newPrompt.length > 10) {
        setPrompts([newPrompt]);
      }
    } catch (e) {
      console.error("Failed to refresh prompts:", e);
    }
    setIsRefreshingPrompts(false);
  };

  const handleGroundingRefresh = async () => {
    setIsGeneratingGrounding(true);
    const messages = [
      { role: 'user', content: 'Generate a single, short, calming mindful moment (maximum 2 sentences). Examples: "Unclench your jaw. Drop your shoulders.", "Take a deep breath and notice the ground beneath your feet." Do not use quotes.' }
    ];
    const response = await callAzureAI(messages);
    setCustomGrounding(response.trim().replace(/^["']|["']$/g, ''));
    setIsGeneratingGrounding(false);
  };

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  const weekEntriesCount = state.entries.filter(e => Date.now() - e.date < 7 * 24 * 3600 * 1000).length;
  const activeHabitsCount = state.habits.length;

  return (
    <div className="page active" id="page-today">
      <div className="page-header">
        <div>
          <p className="page-date">{dateStr} — Take a moment to check in with yourself.</p>
          <h1 className="page-greeting">{greeting}</h1>
        </div>
      </div>

      <div className="today-layout">
        <div className="main-col">
          <div className="reflection-card">
            <div className="reflection-content">
              <h3 className="reflection-title">Today's Reflection</h3>
              <p className="reflection-prompt">
                "{isRefreshingPrompts ? 'Breathing in...' : (prompts[0] || 'What\'s weighing on your mind right now?')}"
              </p>
              <div className="reflection-actions" style={{ alignItems: 'center' }}>
                <button className="btn-reflection-primary" onClick={() => handlePromptClick(prompts[0])}>
                  🖋️ Start Writing
                </button>
                <button className="refresh-link" style={{ marginLeft: '1rem' }} onClick={handlePromptsRefresh} disabled={isRefreshingPrompts}>
                  <span>↻</span> Another prompt
                </button>
              </div>
            </div>
          </div>

          <div className="section-header">
            <h2 className="section-title">Recent Entries</h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button className="btn-ghost-sm" onClick={() => {
                import('../lib/dummyData').then(m => {
                  const { entries, habits } = m.getDummyData();
                  updateState({ entries, habits, streak: calculateStreak(entries) });
                });
              }}>Load Dummy Data</button>
              <a href="#" className="link-muted" onClick={(e) => { e.preventDefault(); updateState({ page: 'journal' }); }}>View all →</a>
            </div>
          </div>

          <div className="entries-list">
            {recentEntries.length === 0 ? (
              <p className="no-entries">No entries yet. Start your first reflection above.</p>
            ) : (
              recentEntries.map(e => (
                <div key={e.id} className="entry-card" onClick={() => updateState({ currentEntryId: e.id, page: 'entry-detail' })}>
                  <div className="entry-card-mood">
                    {MOOD_EMOJIS[e.mood] || '✍️'}
                  </div>
                  <div className="entry-card-meta">
                    <strong>{new Date(e.date).toLocaleDateString('en-US', { weekday: 'long' })}</strong> &nbsp;•&nbsp;
                    {new Date(e.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &nbsp;•&nbsp;
                    {new Date(e.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <p className="entry-card-text">
                    {e.text}
                  </p>
                  {e.tags && e.tags.length > 0 && (
                    <div className="entry-card-tags">
                      {e.tags.map(t => <span key={t} className="entry-card-tag">{t}</span>)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sidebar-col">
          <div className="sidebar-card grounding-card">
            <div className="sidebar-card-title teal">
              GROUNDING MOMENT
              <span className="card-icon-top">✨</span>
            </div>
            <p className="grounding-text">
              {isGeneratingGrounding ? 'Breathing in...' : (customGrounding || GROUNDING[groundingIdx])}
            </p>
            <button className="refresh-link" onClick={handleGroundingRefresh} disabled={isGeneratingGrounding}>
              <span>↻</span> Another prompt
            </button>
          </div>

          <div className="sidebar-card stats-card">
            <div className="sidebar-card-title">THIS WEEK</div>
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-num">{weekEntriesCount}</span>
                <span className="stat-label">Entries</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{activeHabitsCount}</span>
                <span className="stat-label">Active Habits</span>
              </div>
            </div>
          </div>

          <div className="sidebar-card habits-card">
            <div className="sidebar-card-title">
              TODAY'S HABITS
              <span className="card-icon-top">🎯</span>
            </div>
            {state.habits.length === 0 ? (
              <p style={{ fontSize: '.82rem', color: 'var(--text3)' }}>No habits set for today.</p>
            ) : (
              <ul className="habits-mini-list">
                {state.habits.slice(0, 3).map((h, i) => (
                  <li key={i} className="habit-mini-item">
                    <span className="habit-dot"></span>
                    {h.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
