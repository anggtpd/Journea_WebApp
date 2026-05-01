import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { MOOD_EMOJIS } from '../lib/constants';
import { callAzureAI } from '../lib/azureAi';

export default function Insights() {
  const { state, updateState } = useAppContext();
  const [generating, setGenerating] = useState(false);

  const moodCounts = { calm: 0, anxious: 0, sad: 0, hopeful: 0, overwhelmed: 0, grateful: 0, angry: 0, content: 0 };
  state.entries.forEach(e => {
    if (e.mood && moodCounts[e.mood] !== undefined) moodCounts[e.mood]++;
  });
  const maxMood = Math.max(...Object.values(moodCounts), 1);
  const moodBars = Object.entries(moodCounts)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  const weekEntries = state.entries.filter(e => Date.now() - e.date < 7 * 24 * 3600 * 1000);

  const generateWeeklyInsight = async () => {
    if (weekEntries.length < 2) {
      alert('Write at least 2 entries this week first.');
      return;
    }
    setGenerating(true);
    const combined = weekEntries.map(e => `[${new Date(e.date).toLocaleDateString()}] Mood: ${e.mood || 'unknown'}\n${e.text}`).join('\n\n---\n\n');
    const messages = [
      { role: 'user', content: `Please read these journal entries and summarize the week.
Format your response as a JSON string with these exact keys:
- "prose": 2-3 paragraph warm, supportive summary of the week
- "moodTrend": one sentence about how mood fluctuated or evolved
- "emotions": array of strings (e.g. ["Anxious", "Calm"])
- "themes": array of strings (e.g. ["Work stress", "Family"])
- "triggers": array of strings (e.g. ["Deadlines"])

Journal entries this week:\n\n${combined}` }
    ];
    const raw = await callAzureAI(messages);
    let data;
    try {
      const jsonStr = raw.replace(/```json|```/g, '').trim();
      data = JSON.parse(jsonStr);
    } catch (e) {
      data = { prose: raw, moodTrend: '', emotions: [], themes: [], triggers: [] };
    }
    updateState({ weeklyInsightData: data, weeklyInsight: raw });
    setGenerating(false);
  };

  const getStreakSub = (s) => {
    if (s === 0) return 'Write your first entry to start your streak.';
    if (s < 3) return 'Great start — keep the momentum going.';
    if (s < 7) return 'You\'re building something meaningful.';
    return 'You\'re on a roll. Keep going.';
  };

  return (
    <div className="page active" id="page-insights">
      <div className="page-header">
        <div>
          <h1 className="page-title serif">Insights</h1>
          <p className="page-sub">Understand your emotional landscape</p>
        </div>
      </div>

      <div className="insights-grid">
        <div className="card insight-card">
          <h3 className="card-title">Mood Patterns</h3>
          <div className="mood-chart">
            {moodBars.length === 0 ? (
              <p style={{ color: 'var(--text3)', fontSize: '.85rem' }}>No entries yet.</p>
            ) : (
              moodBars.map(([mood, count]) => (
                <div key={mood} className="mood-bar-row">
                  <span className="mood-bar-label">{MOOD_EMOJIS[mood] || ''} {mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
                  <div className="mood-bar-track">
                    <div className="mood-bar-fill" style={{ width: `${(count / maxMood) * 100}%` }}></div>
                  </div>
                  <span className="mood-bar-count">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card insight-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h3 className="card-title" style={{ alignSelf: 'flex-start', marginBottom: 0 }}>Current Streak</h3>
          <div className="streak-display">
            <span className="streak-number">{state.streak || 0}</span>
            <span className="streak-label">days</span>
          </div>
          <p className="streak-sub" style={{ textAlign: 'center' }}>{getStreakSub(state.streak || 0)}</p>
        </div>
      </div>

      <section>
        <div className="section-header">
          <h2 className="section-title">Weekly Reflection</h2>
          <button 
            className="btn-ghost-sm" 
            onClick={generateWeeklyInsight}
            disabled={generating}
          >
            {generating ? 'Generating...' : '✦ Generate Weekly Insights'}
          </button>
        </div>

        <div className="weekly-insight-card">
          <div className="weekly-insight-header">
            <div className="weekly-insight-header-left">
              <span className="wi-icon">⟁</span>
              <span className="wi-week-label">This Week's Insight</span>
            </div>
            <span className="wi-entry-count">
              {weekEntries.length > 0 ? `${weekEntries.length} entr${weekEntries.length === 1 ? 'y' : 'ies'}` : ''}
            </span>
          </div>
          
          <div id="weekly-insight-body">
            {!state.weeklyInsightData ? (
              <p className="insight-placeholder">
                {weekEntries.length < 2 
                  ? 'Write at least 2 journal entries this week to unlock your AI insight.'
                  : 'Click \'Generate Weekly Insights\' to analyse this week.'}
              </p>
            ) : (
              <>
                <p className="wi-prose" dangerouslySetInnerHTML={{ __html: (state.weeklyInsightData.prose || '').replace(/\n/g, '<br/>') }}></p>
                {state.weeklyInsightData.moodTrend && (
                  <div className="wi-trend-callout">
                    <span className="wi-trend-icon">↗</span>
                    <p>{state.weeklyInsightData.moodTrend}</p>
                  </div>
                )}
                <div className="wi-columns">
                  <div className="wi-col">
                    <div className="wi-col-header"><span className="wi-col-icon">🌊</span> EMOTIONS</div>
                    <div className="wi-col-tags">
                      {state.weeklyInsightData.emotions?.length > 0 
                        ? state.weeklyInsightData.emotions.map((e, i) => <span key={i} className="wi-tag wi-tag-emotion">{e}</span>)
                        : <span className="wi-empty">—</span>}
                    </div>
                  </div>
                  <div className="wi-col">
                    <div className="wi-col-header"><span className="wi-col-icon">✧</span> THEMES</div>
                    <div className="wi-col-themes">
                      {state.weeklyInsightData.themes?.length > 0 
                        ? state.weeklyInsightData.themes.map((t, i) => <span key={i} className="wi-theme-item">{t}</span>)
                        : <span className="wi-empty">—</span>}
                    </div>
                  </div>
                  <div className="wi-col">
                    <div className="wi-col-header"><span className="wi-col-icon">⚡</span> TRIGGERS</div>
                    <div className="wi-col-tags">
                      {state.weeklyInsightData.triggers?.length > 0 
                        ? state.weeklyInsightData.triggers.map((t, i) => <span key={i} className="wi-tag wi-tag-trigger">{t}</span>)
                        : <span className="wi-empty">—</span>}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
