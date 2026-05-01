import React from 'react';
import { useAppContext } from './context/AppContext';

import Sidebar from './components/Sidebar';
import Onboarding from './pages/Onboarding';
import Today from './pages/Today';
import Journal from './pages/Journal';
import Insights from './pages/Insights';
import Habits from './pages/Habits';
import NewEntry from './pages/NewEntry';
import EntryDetail from './pages/EntryDetail';

function App() {
  const { state } = useAppContext();

  return (
    <>
      {!state.onboarded ? (
        <Onboarding />
      ) : (
        <div className="app">
          <Sidebar />
          <main className="main-content">
            {state.page === 'today' && <Today />}
            {state.page === 'journal' && <Journal />}
            {state.page === 'insights' && <Insights />}
            {state.page === 'habits' && <Habits />}
            {state.page === 'new-entry' && <NewEntry />}
            {state.page === 'entry-detail' && <EntryDetail />}
          </main>
        </div>
      )}
    </>
  );
}

export default App;
