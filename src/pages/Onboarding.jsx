import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function Onboarding() {
  const { state, updateState } = useAppContext();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [mood, setMood] = useState('');
  const [style, setStyle] = useState('');

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const finish = () => {
    updateState({ onboarded: true, goal, mood, style, page: 'today' });
  };

  if (state.onboarded) return null;

  return (
    <div className="overlay active">
      <div className="onboarding-container">
        {step === 1 && (
          <div className="onboarding-step active">
            <div className="onboarding-logo">
              <span className="logo-icon">✦</span>
              <span className="logo-text">Journea</span>
            </div>
            <h1 className="onboarding-title">A calmer place for<br/><em>your thoughts</em></h1>
            <p className="onboarding-sub">Designed for minds that never stop. Let's create a gentle space just for you.</p>
            <div className="goal-grid">
              {['overthinking', 'clarity', 'anxiety', 'awareness'].map(g => (
                <button 
                  key={g} 
                  className={`goal-card ${goal === g ? 'selected' : ''}`}
                  onClick={() => setGoal(g)}
                >
                  <span className="goal-icon">{g === 'overthinking' ? '🌀' : g === 'clarity' ? '🔍' : g === 'anxiety' ? '🌊' : '🌱'}</span>
                  <span>{g === 'overthinking' ? 'Reduce overthinking' : g === 'clarity' ? 'Gain mental clarity' : g === 'anxiety' ? 'Ease anxiety' : 'Build self-awareness'}</span>
                </button>
              ))}
            </div>
            <button className="btn-primary" disabled={!goal} onClick={nextStep}>Continue →</button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step active">
            <div className="onboarding-logo">
              <span className="logo-icon">✦</span>
              <span className="logo-text">Journea</span>
            </div>
            <h2 className="onboarding-title">How are you feeling<br/><em>right now?</em></h2>
            <p className="onboarding-sub">No right or wrong answer. Just what's true for you at this moment.</p>
            <div className="mood-grid">
              {['calm', 'anxious', 'sad', 'hopeful', 'overwhelmed', 'grateful'].map(m => (
                <button 
                  key={m} 
                  className={`mood-card ${mood === m ? 'selected' : ''}`}
                  onClick={() => setMood(m)}
                >
                  <span>{m === 'calm' ? '😌' : m === 'anxious' ? '😰' : m === 'sad' ? '😔' : m === 'hopeful' ? '🌤' : m === 'overwhelmed' ? '😵' : '🙏'}</span>
                  <small>{m.charAt(0).toUpperCase() + m.slice(1)}</small>
                </button>
              ))}
            </div>
            <div className="step-nav">
              <button className="btn-ghost" onClick={prevStep}>← Back</button>
              <button className="btn-primary" disabled={!mood} onClick={nextStep}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step active">
            <div className="onboarding-logo">
              <span className="logo-icon">✦</span>
              <span className="logo-text">Journea</span>
            </div>
            <h2 className="onboarding-title">Choose your<br/><em>journaling style</em></h2>
            <p className="onboarding-sub">You can always change this later.</p>
            <div className="style-grid">
              {[
                { s: 'guided', icon: '🧭', title: 'Guided', desc: 'AI prompts to lead the way' },
                { s: 'flexible', icon: '🌿', title: 'Flexible', desc: 'Prompts + your own flow' },
                { s: 'minimal', icon: '✏️', title: 'Minimal', desc: 'Blank canvas, pure writing' }
              ].map(item => (
                <button 
                  key={item.s} 
                  className={`style-card ${style === item.s ? 'selected' : ''}`}
                  onClick={() => setStyle(item.s)}
                >
                  <span className="style-icon">{item.icon}</span>
                  <strong>{item.title}</strong>
                  <small>{item.desc}</small>
                </button>
              ))}
            </div>
            <div className="step-nav">
              <button className="btn-ghost" onClick={prevStep}>← Back</button>
              <button className="btn-primary" disabled={!style} onClick={finish}>Begin Reflecting →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
