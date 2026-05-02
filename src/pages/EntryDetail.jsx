import React from 'react';
import { useAppContext } from '../context/AppContext';
import { MOOD_EMOJIS } from '../lib/constants';
import { calculateStreak } from '../lib/utils';

export default function EntryDetail() {
  const { state, updateState } = useAppContext();
  
  const entry = state.entries.find(e => e.id === state.currentEntryId);
  
  if (!entry) return null;

  const deleteEntry = () => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    const newEntries = state.entries.filter(e => e.id !== state.currentEntryId);
    
    updateState({ 
      entries: newEntries, 
      streak: calculateStreak(newEntries), 
      currentEntryId: null, 
      page: 'journal' 
    });
  };

  const dateStr = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page active" id="page-entry-detail">
      <div className="page-header">
        <div>
          <button className="btn-ghost-sm" style={{ marginBottom: '1rem' }} onClick={() => updateState({ page: 'journal' })}>← Back to Journal</button>
        </div>
        <div>
          <button className="btn-ghost-sm btn-danger" onClick={deleteEntry}>Delete Entry</button>
        </div>
      </div>

      <div className="entry-detail-content">
        <div className="detail-header">
          <p className="detail-date">{dateStr}</p>
          {entry.mood && (
            <div className="detail-mood">
              {MOOD_EMOJIS[entry.mood] || ''} {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
            </div>
          )}
          {entry.tags && entry.tags.length > 0 && (
            <div className="entry-tags" style={{ marginTop: '.5rem' }}>
              {entry.tags.map(t => <span key={t} className="entry-tag">{t}</span>)}
            </div>
          )}
        </div>

        {entry.prompt && (
          <p style={{ fontSize: '.85rem', color: 'var(--text3)', fontStyle: 'italic', marginBottom: '1rem' }}>
            Prompt: "{entry.prompt}"
          </p>
        )}

        <div className="detail-body">
          {entry.text}
        </div>

        {(entry.aiResponse || entry.aiFollowup) && (
          <div className="detail-ai-section">
            <div className="detail-ai-label">✦ JOURNEA REFLECTION</div>
            {entry.aiResponse && (
              <p className="detail-ai-text" dangerouslySetInnerHTML={{ __html: entry.aiResponse.replace(/\\n/g, '<br/>') }}></p>
            )}
            {entry.aiFollowup && (
              <div className="ai-followup">
                <p className="followup-question">{entry.aiFollowup}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
