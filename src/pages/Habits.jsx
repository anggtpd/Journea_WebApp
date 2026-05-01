import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { HABIT_SUGGESTIONS } from '../lib/constants';
import { callAzureAI } from '../lib/azureAi';

export default function Habits() {
  const { state, updateState } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitFreq, setNewHabitFreq] = useState('daily');
  const [newHabitTime, setNewHabitTime] = useState('');

  const todayStr = new Date().toDateString();
  const weekEntries = state.entries.filter(e => Date.now() - e.date < 7 * 24 * 3600 * 1000);

  useEffect(() => {
    if (!state.habitSuggestion) {
      loadSuggestion();
    }
  }, []);

  const loadSuggestion = async () => {
    if (weekEntries.length < 1) {
      const rand = HABIT_SUGGESTIONS[Math.floor(Math.random() * HABIT_SUGGESTIONS.length)];
      updateState({ habitSuggestion: rand });
      return;
    }
    const messages = [
      { role: 'system', content: 'You are Journea. Based on these journal entries, suggest ONE short, gentle habit (max 8 words). Return only the habit name, nothing else.' },
      { role: 'user', content: weekEntries.map(e => `Mood:${e.mood} — ${e.text.slice(0, 200)}`).join('\n') },
    ];
    const suggestion = await callAzureAI(messages);
    const habitName = suggestion.replace(/["*]/g, '').trim().split('\n')[0].slice(0, 60);
    updateState({ habitSuggestion: { name: habitName, freq: 'daily' } });
  };

  const toggleHabit = (idx) => {
    const newHabits = [...state.habits];
    const h = newHabits[idx];
    if (h.doneToday === todayStr) {
      h.doneToday = '';
      if (h.streak > 0) h.streak--;
    } else {
      h.doneToday = todayStr;
      h.streak = (h.streak || 0) + 1;
    }
    updateState({ habits: newHabits });
  };

  const deleteHabit = (idx) => {
    if (!confirm('Remove this habit?')) return;
    const newHabits = [...state.habits];
    newHabits.splice(idx, 1);
    updateState({ habits: newHabits });
  };

  const saveHabit = () => {
    if (!newHabitName.trim()) { alert('Please enter a habit name.'); return; }
    const newHabits = [...state.habits, { name: newHabitName.trim(), freq: newHabitFreq, time: newHabitTime, streak: 0, doneToday: '' }];
    updateState({ habits: newHabits });
    closeModal();
  };

  const addSuggestedHabit = () => {
    if (!state.habitSuggestion) return;
    const newHabits = [...state.habits, { ...state.habitSuggestion, streak: 0, doneToday: '' }];
    updateState({ habits: newHabits });
  };

  const closeModal = () => {
    setModalOpen(false);
    setNewHabitName('');
    setNewHabitFreq('daily');
    setNewHabitTime('');
  };

  return (
    <div className="page active" id="page-habits">
      <div className="page-header">
        <div>
          <h1 className="page-title serif">Gentle Habits</h1>
          <p className="page-sub">Small daily anchors for a calmer mind</p>
        </div>
        <button className="btn-teal-sm" onClick={() => setModalOpen(true)}>+ Add Habit</button>
      </div>

      <div className="habits-list">
        {!state.habits || state.habits.length === 0 ? (
          <p className="empty-habits">No habits yet. Add one above or use the AI suggestion below.</p>
        ) : (
          state.habits.map((h, i) => (
            <div key={i} className="habit-card">
              <div className={`habit-check ${h.doneToday === todayStr ? 'done' : ''}`}
                onClick={() => toggleHabit(i)}
              >
                {h.doneToday === todayStr ? '✓' : ''}
              </div>
              <div className="habit-info">
                <div className="habit-name">{h.name}</div>
                <div className="habit-freq">{h.freq} {h.time ? `· ${h.time}` : ''}</div>
              </div>
              <span className="habit-streak">{h.streak || 0} day streak</span>
              <button className="habit-delete" onClick={() => deleteHabit(i)}>✕</button>
            </div>
          ))
        )}
      </div>

      <div className="section-header mt-md">
        <h2 className="section-title">For You</h2>
      </div>
      <div className="ai-habit-suggestion-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
          <span style={{ fontSize: '.8rem', color: 'var(--teal)' }}>✦</span>
          <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--teal)', letterSpacing: '.05em' }}>AI SUGGESTION</span>
        </div>
        <p className="habit-suggestion-text">
          {state.habitSuggestion ? `Based on your recent entries, try: "${state.habitSuggestion.name}"` : 'Loading suggestion...'}
        </p>
        <button 
          className="btn-ghost-sm" 
          style={{ width: 'max-content', padding: '.4rem .8rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
          onClick={addSuggestedHabit}
          disabled={!state.habitSuggestion}
        >
          + Add this habit
        </button>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') closeModal(); }}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">New Habit</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <label className="form-label">Habit Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g., 5-minute breathing" 
                style={{ marginBottom: '1.25rem' }} 
                value={newHabitName}
                onChange={e => setNewHabitName(e.target.value)}
              />
              
              <label className="form-label">Frequency</label>
              <div className="freq-row">
                <button className={`freq-pill ${newHabitFreq === 'daily' ? 'active' : ''}`} onClick={() => setNewHabitFreq('daily')}>Daily</button>
                <button className={`freq-pill ${newHabitFreq === 'weekdays' ? 'active' : ''}`} onClick={() => setNewHabitFreq('weekdays')}>Weekdays</button>
                <button className={`freq-pill ${newHabitFreq === 'weekly' ? 'active' : ''}`} onClick={() => setNewHabitFreq('weekly')}>Weekly</button>
              </div>
              
              <label className="form-label" style={{ marginTop: '1.25rem' }}>Time of day (optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g., Morning, 8:00 PM" 
                value={newHabitTime}
                onChange={e => setNewHabitTime(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={saveHabit}>Save Habit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
