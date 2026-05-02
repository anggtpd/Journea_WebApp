import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { PROMPTS, MOOD_EMOJIS } from '../lib/constants';
import { callAzureAI } from '../lib/azureAi';
import { calculateStreak } from '../lib/utils';

export default function NewEntry() {
  const { state, updateState } = useAppContext();
  const [text, setText] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [aiResponse, setAiResponse] = useState('');
  const [aiFollowup, setAiFollowup] = useState('');
  const [isReflecting, setIsReflecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Tap to start speaking');
  const [voiceSupported, setVoiceSupported] = useState(false);
  
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const interimStartRef = useRef(0);

  useEffect(() => {
    // Initialization when entering page
    const mood = state.mood || 'default';
    const pool = PROMPTS[mood] || PROMPTS.default;
    setCurrentPrompt(state.currentPrompt || 'Free Write');
    setText('');
    setTags([]);
    setSelectedMood('');
    setAiResponse('');
    setAiFollowup('');
    
    // Voice support check
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('Listening... (speak now)');
        interimStartRef.current = textareaRef.current?.value.length || 0;
      };
      
      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (!textareaRef.current) return;
        const currentVal = textareaRef.current.value;
        const base = currentVal.slice(0, interimStartRef.current);
        const committed = currentVal.slice(interimStartRef.current).replace(/\[.*?\]/g, '');
        if (final) {
          const newVal = base + committed + final;
          setText(newVal);
          interimStartRef.current = newVal.length;
          setVoiceStatus('Got it — keep talking or stop');
        } else if (interim) {
          setText(base + committed + `[${interim}]`);
        }
      };
      
      recognition.onerror = (e) => {
        if (e.error === 'not-allowed') setVoiceStatus('Microphone access denied');
        else if (e.error === 'no-speech') setVoiceStatus('No speech detected');
        else setVoiceStatus(`Error: ${e.error}`);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        if (isListening) {
          try { recognition.start(); } catch(e) { setIsListening(false); }
        }
      };
      
      recognitionRef.current = recognition;
    }
  }, [state.currentPrompt, state.mood]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
      setVoiceStatus('Tap to start speaking');
      // clean up brackets if any
      setText(prev => prev.replace(/\[.*?\]/g, ''));
    } else {
      interimStartRef.current = text.length;
      if (text && !text.endsWith(' ') && !text.endsWith('\n')) {
        setText(prev => prev + ' ');
        interimStartRef.current += 1;
      }
      try {
        recognitionRef.current.start();
      } catch (e) {
        // already started
      }
    }
  };

  const handleNewPrompt = () => {
    const mood = selectedMood || state.mood || 'default';
    const pool = PROMPTS[mood] || PROMPTS.default;
    let next = pool[Math.floor(Math.random() * pool.length)];
    let tries = 0;
    while (next === currentPrompt && pool.length > 1 && tries < 5) {
      next = pool[Math.floor(Math.random() * pool.length)];
      tries++;
    }
    setCurrentPrompt(next);
  };

  const handleUsePrompt = () => {
    if (!text.trim()) {
      setText('');
    }
    textareaRef.current?.focus();
  };

  const handleMoodSelect = (m) => {
    setSelectedMood(m);
    const pool = PROMPTS[m] || PROMPTS.default;
    setCurrentPrompt(pool[Math.floor(Math.random() * pool.length)]);
  };

  const handleTagInput = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const val = tagInput.trim().replace(',', '');
      if (val && !tags.includes(val) && tags.length < 5) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const getAIResponse = async () => {
    if (!text.trim()) { alert('Please write something first.'); return; }
    setIsReflecting(true);
    setAiResponse('');
    setAiFollowup('');
    const mood = selectedMood || state.mood || '';
    const messages = [
      { role: 'user', content: `You are Journea, a compassionate journaling companion for overthinkers. Your tone is warm, gentle, non-judgmental. Keep responses to 2-3 short paragraphs. End with a short follow-up question prefixed with **Follow-up:**. User's current mood: ${mood}.\n\nUser Entry: ${text}` }
    ];
    const response = await callAzureAI(messages);
    setIsReflecting(false);
    const parts = response.split('**Follow-up:**');
    setAiResponse(parts[0].trim());
    if (parts[1]) setAiFollowup(parts[1].trim());
  };

  const saveEntry = () => {
    if (!text.trim()) { alert('Please write something before saving.'); return; }
    const entry = {
      id: Date.now().toString(),
      date: Date.now(),
      text,
      mood: selectedMood || state.mood || '',
      prompt: currentPrompt,
      tags: [...tags],
      aiResponse,
      aiFollowup
    };

    updateState({ 
      entries: [entry, ...state.entries], 
      streak: calculateStreak([entry, ...state.entries]),
      page: 'journal'
    });
  };

  const words = text.replace(/\[.*?\]/g, '').trim().split(/\s+/).filter(w => w).length;
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="page active" id="page-new-entry">
      <div className="page-header">
        <div>
          <p className="page-date">{dateStr}</p>
          <h1 className="page-title">New Entry</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn-ghost" onClick={() => updateState({ page: 'today' })}>Cancel</button>
        </div>
      </div>

      <div className="card mb-md">
        <p className="card-label">How are you feeling?</p>
        <div className="mood-row">
          {['calm', 'anxious', 'sad', 'hopeful', 'overwhelmed', 'grateful'].map(m => (
            <button 
              key={m} 
              className={`mood-pill ${selectedMood === m ? 'selected' : ''}`}
              onClick={() => handleMoodSelect(m)}
            >
              {MOOD_EMOJIS[m]} {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-prompt-card">
        <div className="ai-prompt-header">
          <span className="ai-badge">✦ PROMPT</span>
          <button className="btn-ghost-sm" onClick={handleNewPrompt}>↻ Another one</button>
        </div>
        <p className="ai-prompt-text">{currentPrompt}</p>
        <button className="btn-use-prompt" onClick={handleUsePrompt}>Use this prompt</button>
      </div>

      <div className="writing-area-wrapper">
        {voiceSupported && (
          <div className={`voice-bar ${isListening ? 'listening' : ''}`}>
            <button className={`mic-btn ${isListening ? 'active' : ''}`} onClick={toggleMic} title="Voice Input">
              <span className="mic-icon">🎙️</span>
            </button>
            <span className="voice-status">{voiceStatus}</span>
            {isListening && (
              <div className="voice-wave">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
            )}
          </div>
        )}
        <textarea 
          ref={textareaRef}
          className="writing-area" 
          placeholder="Start writing..." 
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={voiceSupported ? { borderRadius: '0 0 var(--radius) var(--radius)' } : {}}
        ></textarea>
        <div className="writing-footer">
          <div className="tag-input-area">
            <span className="tag-label">Tags:</span>
            <div className="tags-container">
              {tags.map(t => (
                <span key={t} className="tag-chip">
                  {t}<span className="tag-chip-remove" onClick={() => setTags(tags.filter(x => x !== t))}>×</span>
                </span>
              ))}
              <input 
                type="text" 
                className="tag-input" 
                placeholder="Add a tag..." 
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagInput}
              />
            </div>
          </div>
          <span className="word-count">{words} word{words !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {(isReflecting || aiResponse) && (
        <div className="ai-response-card">
          <div className="ai-response-header">
            <span className="ai-badge">✦ JOURNEA</span>
            {isReflecting && (
              <div className="ai-typing-indicator">
                <span></span><span></span><span></span>
              </div>
            )}
          </div>
          {!isReflecting && (
            <>
              <p className="ai-response-text" dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\\n/g, '<br/>') }}></p>
              {aiFollowup && (
                <div className="ai-followup">
                  <p className="followup-question">{aiFollowup}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="entry-actions">
        <button className="btn-ghost" onClick={getAIResponse} disabled={isReflecting}>
          {isReflecting ? 'Reflecting...' : '✦ Get AI Reflection'}
        </button>
        <button className="btn-primary" onClick={saveEntry}>Save Entry</button>
      </div>
    </div>
  );
}
