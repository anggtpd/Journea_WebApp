import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PROMPTS, MOOD_EMOJIS, GROUNDING } from '../lib/constants';
import { callAzureAI } from '../lib/azureAi';

export default function Today() {
  const { state, updateState } = useAppContext();
  const [prompts, setPrompts] = useState([]);
  const [groundingIdx, setGroundingIdx] = useState(0);
  const [customGrounding, setCustomGrounding] = useState('');
  const [isGeneratingGrounding, setIsGeneratingGrounding] = useState(false);

  useEffect(() => {
    const mood = state.mood || 'default';
    const pool = PROMPTS[mood] || PROMPTS.default;
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
    setPrompts(shuffled);
    setGroundingIdx(Math.floor(Math.random() * GROUNDING.length));
  }, [state.mood]);

  const recentEntries = [...state.entries].sort((a, b) => b.date - a.date).slice(0, 3);

  const handlePromptClick = (p) => {
    updateState({ currentPrompt: p, page: 'new-entry' });
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

  return (
    <div className="page active" id="page-today">
      <div className="page-header">
        <div>
          <p className="page-date">{dateStr}</p>
          <h1 className="page-greeting">{greeting}</h1>
          <p className="page-sub">Take a deep breath. You're doing just fine.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* {state.mood && (
            <div className="mood-badge" style={{ display: 'inline-flex' }}>
              {MOOD_EMOJIS[state.mood] || ''} {state.mood}
            </div>
          )} */}
          <button className="btn-ghost" onClick={() => {
            import('../lib/dummyData').then(m => {
              const { entries, habits } = m.getDummyData();
              updateState({ entries, habits, streak: 4 });
            });
          }}>
            Load Dummy Data
          </button>
          <button className="btn-primary" onClick={() => updateState({ page: 'new-entry' })}>
            + Start Writing
          </button>
        </div>
      </div>

      <div className="grounding-card">
        <div className="grounding-header">
          <span className="grounding-label">✦ MINDFUL MOMENT</span>
          <button 
            className="btn-ghost-sm" 
            onClick={handleGroundingRefresh}
            disabled={isGeneratingGrounding}
          >
            ↻ Refresh
          </button>
        </div>
        <p className="grounding-text">
          {isGeneratingGrounding ? (
            <span style={{ opacity: 0.7 }}>Breathing in...</span>
          ) : (
            customGrounding || GROUNDING[groundingIdx]
          )}
        </p>
      </div>

      <div className="section-header">
        <h2 className="section-title">Today's Prompts</h2>
      </div>
      <div className="prompts-grid mb-md">
        {prompts.map((p, i) => (
          <div key={i} className="prompt-card" onClick={() => handlePromptClick(p)}>
            <p>{p}</p>
            <span className="prompt-use">Write about this →</span>
          </div>
        ))}
      </div>

      <div className="section-header mt-lg">
        <h2 className="section-title">Recent Entries</h2>
        <a href="#" className="link-muted" onClick={(e) => { e.preventDefault(); updateState({ page: 'journal' }); }}>See all →</a>
      </div>
      <div className="entries-list">
        {recentEntries.length === 0 ? (
          <p className="no-entries">No entries yet. Start your first reflection above.</p>
        ) : (
          recentEntries.map(e => (
            <div key={e.id} className="entry-card" onClick={() => updateState({ currentEntryId: e.id, page: 'entry-detail' })}>
              <div className="entry-card-left">
                <div className="entry-meta">
                  <span className="entry-date-label">
                    {new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  {e.mood && (
                    <span className="entry-mood-tag">{MOOD_EMOJIS[e.mood] || ''} {e.mood}</span>
                  )}
                </div>
                <p className="entry-preview">
                  {e.text.replace(/\n/g, ' ').slice(0, 120) + (e.text.length > 120 ? '...' : '')}
                </p>
                {e.tags && e.tags.length > 0 && (
                  <div className="entry-tags">
                    {e.tags.map(t => <span key={t} className="entry-tag">{t}</span>)}
                  </div>
                )}
              </div>
              <span className="entry-arrow">›</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
