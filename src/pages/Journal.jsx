import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { MOOD_EMOJIS } from '../lib/constants';

export default function Journal() {
  const { state, updateState } = useAppContext();
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [calDate, setCalDate] = useState(new Date());

  const entries = useMemo(() => {
    let filtered = state.entries;
    if (activeFilter) {
      filtered = filtered.filter(e => e.mood === activeFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(e => e.text.toLowerCase().includes(q) || (e.tags && e.tags.some(t => t.toLowerCase().includes(q))));
    }
    return [...filtered].sort((a, b) => b.date - a.date);
  }, [state.entries, search, activeFilter]);

  const toggleFilter = (f) => {
    setActiveFilter(prev => prev === f ? '' : f);
  };

  const openEntry = (id) => updateState({ currentEntryId: id, page: 'entry-detail' });

  // Calendar logic
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const monthLabel = calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const entryMap = {};
  state.entries.forEach(e => {
    const d = new Date(e.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate();
      if (!entryMap[key]) entryMap[key] = [];
      entryMap[key].push(e);
    }
  });

  const emptyCells = Array(firstDay).fill(null);
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h1 className="page-title serif">Journal</h1>
          {state.entries.length > 0 && (
            <p className="journal-entry-count">{state.entries.length} entr{state.entries.length === 1 ? 'y' : 'ies'} so far</p>
          )}
        </div>
        <div className="journal-header-right">
          <div className="view-toggle">
            <button className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
              <span>⊞</span> List
            </button>
            <button className={`view-toggle-btn ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>
              <span>🗓</span> Calendar
            </button>
          </div>
          <button className="btn-teal-sm" onClick={() => updateState({ page: 'new-entry' })}>✎ New Entry</button>
        </div>
      </div>

      {view === 'list' ? (
        <div>
          <div className="search-bar-wrap">
            <input 
              type="text" 
              className="search-bar" 
              placeholder="🔍  Search entries..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-row">
            {['calm', 'anxious', 'sad', 'hopeful', 'overwhelmed', 'grateful'].map(m => (
              <button 
                key={m} 
                className={`filter-pill ${activeFilter === m ? 'active' : ''}`}
                onClick={() => toggleFilter(m)}
              >
                {MOOD_EMOJIS[m]} {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          <div className="journal-entries-list">
            {entries.length === 0 ? (
              <p className="no-entries">No entries found.</p>
            ) : (
              entries.map(e => (
                <div key={e.id} className="entry-card" onClick={() => openEntry(e.id)}>
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
      ) : (
        <div className="cal-wrap">
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={() => setCalDate(new Date(year, month - 1, 1))}>‹</button>
            <span className="cal-month-label">{monthLabel}</span>
            <button className="cal-nav-btn" onClick={() => setCalDate(new Date(year, month + 1, 1))}>›</button>
          </div>
          <div className="cal-grid-header">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div className="cal-grid">
            {emptyCells.map((_, i) => <div key={`empty-${i}`} className="cal-cell empty"></div>)}
            {dayCells.map(day => {
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              const dayEntries = entryMap[day] || [];
              const hasEntry = dayEntries.length > 0;
              return (
                <div 
                  key={day} 
                  className={`cal-cell ${hasEntry ? 'has-entry' : ''} ${isToday ? 'is-today' : ''}`}
                  onClick={() => hasEntry && openEntry(dayEntries[0].id)}
                >
                  <span className="cal-day-num">{day}</span>
                  {hasEntry && (
                    <div className="cal-mood-emoji">{MOOD_EMOJIS[dayEntries[0].mood] || '📝'}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
