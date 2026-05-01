import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { QUOTES } from '../lib/constants';

export default function Sidebar() {
  const { state, updateState } = useAppContext();
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  const navItems = [
    { id: 'today', icon: '🌅', label: 'Today' },
    { id: 'new-entry', icon: '✍️', label: 'New Entry' },
    { id: 'journal', icon: '📖', label: 'Journal' },
    { id: 'insights', icon: '✨', label: 'Insights' },
    { id: 'habits', icon: '🌱', label: 'Habits' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">✦</span>
        <span className="logo-text">Journea</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <a
            key={item.id}
            href="#"
            className={`nav-item ${state.page === item.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              updateState({ page: item.id });
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="sidebar-quote">
        <p className="quote-text">{quote.t}</p>
        <span className="quote-author">— {quote.a}</span>
      </div>
    </aside>
  );
}
