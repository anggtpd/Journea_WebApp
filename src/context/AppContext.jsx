import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateStreak } from '../lib/utils';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    try {
      const s = localStorage.getItem('reflectai_state');
      if (s) {
        return {
          page: 'today',
          onboarded: false,
          goal: '',
          mood: '',
          style: 'guided',
          entries: [],
          habits: [],
          currentEntryId: null,
          selectedMoodEntry: '',
          currentPrompt: '',
          tags: [],
          weeklyInsight: '',
          habitSuggestion: null,
          ...JSON.parse(s)
        };
      }
    } catch (e) {}
    return {
      page: 'today',
      onboarded: false,
      goal: '',
      mood: '',
      style: 'guided',
      entries: [],
      habits: [],
      currentEntryId: null,
      selectedMoodEntry: '',
      currentPrompt: '',
      tags: [],
      weeklyInsight: '',
      habitSuggestion: null,
    };
  });

  useEffect(() => {
    // Recalculate streak on mount to ensure it's always accurate
    const actualStreak = calculateStreak(state.entries || []);
    if (actualStreak !== state.streak) {
      updateState({ streak: actualStreak });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('reflectai_state', JSON.stringify(state));
  }, [state]);

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider value={{ state, updateState }}>
      {children}
    </AppContext.Provider>
  );
};
