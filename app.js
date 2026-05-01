// ── Journea app.js ──
const QUOTES = [
  { t: '"You don\'t have to control your thoughts. You just have to stop letting them control you."', a: 'Dan Millman' },
  { t: '"Almost everything will work again if you unplug it for a few minutes, including you."', a: 'Anne Lamott' },
  { t: '"Feelings are just visitors, let them come and go."', a: 'Mooji' },
  { t: '"You are allowed to be both a masterpiece and a work in progress."', a: 'Sophia Bush' },
];
const GROUNDING = [
  'Take a slow breath. Notice five things you can see around you right now. You are here. You are safe.',
  'Place both feet flat on the floor. Feel the ground beneath you. You are supported.',
  'Breathe in for 4 counts, hold for 4, out for 6. Your nervous system is listening.',
  'Name three sounds you can hear right now. Let your mind anchor to this present moment.',
  'Put your hand on your chest. Feel your heartbeat. This moment is real and you are in it.',
];
const PROMPTS = {
  calm: ['What small moment brought you peace today?', 'If today had a color, what would it be and why?', 'What are you grateful for right now, in this quiet moment?'],
  anxious: ['What is the one worry taking up the most space right now? Write it out fully.', 'What would you tell a friend feeling exactly what you feel?', 'What does your anxiety actually need from you right now?'],
  sad: ['What loss, big or small, are you sitting with today?', 'What would feel like a small act of kindness toward yourself right now?', 'Where in your body do you feel this sadness? Describe it gently.'],
  hopeful: ['What feels possible today that didn\'t yesterday?', 'Who or what is fueling your sense of hope?', 'Write about a future version of yourself you\'re slowly becoming.'],
  overwhelmed: ['List every single thing on your mind — just get it out of your head.', 'What one thing, if done today, would bring the most relief?', 'What can you let go of — just for today?'],
  grateful: ['What unexpected thing are you grateful for?', 'Write a letter of thanks to someone (you don\'t have to send it).', 'What is your body doing well for you today?'],
  angry: ['What boundary was crossed that triggered this frustration?', 'Write the unfiltered version first — then what you actually want to say.', 'What is this frustration trying to protect in you?'],
  content: ['Capture this feeling — what made today feel just right?', 'What habit or routine contributed to how you feel?', 'Who deserves appreciation for the contentment you feel?'],
  default: ['What\'s been on your mind most today?', 'Describe your day in three words — then expand on each.', 'What do you need to say that you haven\'t said yet?'],
};
const HABIT_SUGGESTIONS = [
  { name: '5-min morning breathing', freq: 'daily' },
  { name: 'Evening brain dump journaling', freq: 'daily' },
  { name: 'Midday 2-min grounding check-in', freq: 'weekdays' },
  { name: 'Screen-free wind-down (30 min before bed)', freq: 'daily' },
  { name: 'Gratitude list (3 things)', freq: 'daily' },
  { name: 'Mindful walk without phone', freq: '3x' },
];

// ── STATE ──
let state = {
  page: 'today', onboarded: false,
  goal: '', mood: '', style: 'guided',
  entries: [], habits: [], currentEntryId: null,
  selectedMoodEntry: '', currentPrompt: '', tags: [],
  weeklyInsight: '', habitSuggestion: null,
};

function loadState() {
  try { const s = localStorage.getItem('reflectai_state'); if (s) state = { ...state, ...JSON.parse(s) }; } catch (e) { }
}
function saveState() {
  try { localStorage.setItem('reflectai_state', JSON.stringify(state)); } catch (e) { }
}

// ── AZURE AI ──
async function callAzureAI(messages) {
  const { endpoint, apiKey, deploymentName, apiVersion } = AZURE_CONFIG;
  if (!apiKey || apiKey === 'YOUR_AZURE_API_KEY') {
    return simulateAI(messages);
  }
  try {
    const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'api-key': apiKey }, body: JSON.stringify({ messages, max_completion_tokens: 800 }) });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (e) { return simulateAI(messages); }
}
function simulateAI(messages) {
  const last = messages[messages.length - 1]?.content || '';
  const responses = [
    "What you've written shows real courage. Overthinkers often mistake rumination for reflection — but what you're doing here is different. This is you choosing to understand yourself rather than judge yourself. That matters.\n\n**Follow-up:** What would it feel like to be just 10% kinder to yourself today?",
    "There's a lot of weight in these words, and you're carrying it thoughtfully. The fact that you're naming it — giving it shape — means it has less power over you than it did five minutes ago.\n\n**Follow-up:** What's one tiny thing that felt okay today, even in the middle of all this?",
    "Reading this, I notice you're holding a lot. That's okay. You don't have to solve everything right now. Sometimes just externalizing the swirl is enough for today.\n\n**Follow-up:** If your feelings had a temperature right now, what would it be?",
    "What you're describing resonates deeply. Many people who overthink are actually very sensitive, perceptive humans — your mind works hard because you care. The work is learning to give it rest.\n\n**Follow-up:** What does rest look like for you, specifically?",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setDate();
  setGreeting();
  setWeekLabel();
  setRandomQuote();
  setupOnboarding();
  setupNav();
  setupNewEntry();
  setupJournal();
  setupHabits();
  setupInsights();
  setupGrounding();
  if (state.onboarded) { showApp(); navigate(state.page || 'today'); }
  else { document.getElementById('onboarding-overlay').classList.add('active'); }
});

function setDate() {
  const d = new Date();
  const opts = { weekday: 'long', month: 'long', day: 'numeric' };
  const str = d.toLocaleDateString('en-US', opts);
  document.getElementById('today-date').textContent = str;
  document.getElementById('new-entry-date').textContent = str;
}
function setGreeting() {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('today-greeting').textContent = g;
}
function setWeekLabel() {
  const now = new Date();
  const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 1);
  const fmt = d => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const el = document.getElementById('week-label');
  if (el) el.textContent = `Week of ${fmt(start)}`;
}
function setRandomQuote() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  document.getElementById('sidebar-quote').textContent = q.t;
}

function showApp() {
  document.getElementById('onboarding-overlay').classList.remove('active');
  document.getElementById('app').classList.remove('hidden');
  if (state.mood) {
    const mb = document.getElementById('today-mood-badge');
    const moodEmojis = { calm: '😌', anxious: '😰', sad: '😔', hopeful: '🌤', overwhelmed: '😵', grateful: '🙏', angry: '😤', content: '☀️' };
    mb.textContent = `${moodEmojis[state.mood] || ''}  ${state.mood}`;
    mb.style.display = 'inline-flex';
  }
}

// ── ONBOARDING ──
function setupOnboarding() {
  // Step 1 — goal
  document.querySelectorAll('.goal-card').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.goal-card').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected'); state.goal = btn.dataset.goal;
      document.getElementById('step1-next').disabled = false;
    });
  });
  document.getElementById('step1-next').addEventListener('click', () => goToStep(2));
  // Step 2 — mood
  document.querySelectorAll('#onboarding-mood-grid .mood-card').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#onboarding-mood-grid .mood-card').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected'); state.mood = btn.dataset.mood;
      document.getElementById('step2-next').disabled = false;
    });
  });
  document.getElementById('step2-back').addEventListener('click', () => goToStep(1));
  document.getElementById('step2-next').addEventListener('click', () => goToStep(3));
  // Step 3 — style
  document.querySelectorAll('.style-card').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.style-card').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected'); state.style = btn.dataset.style;
      document.getElementById('step3-next').disabled = false;
    });
  });
  document.getElementById('step3-back').addEventListener('click', () => goToStep(2));
  document.getElementById('step3-next').addEventListener('click', () => {
    state.onboarded = true; saveState(); showApp(); navigate('today'); renderTodayPage();
  });
}
function goToStep(n) {
  document.querySelectorAll('.onboarding-step').forEach(s => s.classList.remove('active'));
  document.querySelector(`.onboarding-step[data-step="${n}"]`).classList.add('active');
}

// ── NAV ──
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); navigate(a.dataset.page); });
  });
  document.getElementById('see-all-link').addEventListener('click', e => { e.preventDefault(); navigate('journal'); });
  document.getElementById('new-entry-from-journal').addEventListener('click', () => navigate('new-entry'));
  document.getElementById('start-writing-btn').addEventListener('click', () => navigate('new-entry'));
  document.getElementById('cancel-entry-btn').addEventListener('click', () => navigate('today'));
  document.getElementById('back-to-journal-btn').addEventListener('click', () => navigate('journal'));
  document.getElementById('nav-new-entry').addEventListener('click', e => { e.preventDefault(); navigate('new-entry'); });
}
function navigate(page) {
  state.page = page; saveState();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(a => a.classList.remove('active'));
  const pg = document.getElementById(`page-${page}`);
  if (pg) pg.classList.add('active');
  const nav = document.getElementById(`nav-${page}`);
  if (nav) nav.classList.add('active');
  if (page === 'today') renderTodayPage();
  if (page === 'journal') renderJournalPage();
  if (page === 'insights') renderInsightsPage();
  if (page === 'habits') renderHabitsPage();
  if (page === 'new-entry') resetNewEntry();
  document.querySelector('.main-content').scrollTop = 0;
}

// ── TODAY PAGE ──
function renderTodayPage() {
  renderTodayPrompts();
  renderRecentEntries();
}
function renderTodayPrompts() {
  const mood = state.mood || 'default';
  const pool = PROMPTS[mood] || PROMPTS.default;
  const shuffled = [...pool].sort(() => Math.random() - .5).slice(0, 3);
  const grid = document.getElementById('today-prompts');
  grid.innerHTML = shuffled.map((p, i) => `
    <div class="prompt-card" id="prompt-card-${i}" data-prompt="${p.replace(/"/g, '&quot;')}">
      <p>${p}</p>
      <span class="prompt-use">Write about this →</span>
    </div>`).join('');
  grid.querySelectorAll('.prompt-card').forEach(c => {
    c.addEventListener('click', () => {
      state.currentPrompt = c.dataset.prompt;
      navigate('new-entry');
    });
  });
}
function renderRecentEntries() {
  const list = document.getElementById('recent-entries-list');
  const recent = [...state.entries].sort((a, b) => b.date - a.date).slice(0, 3);
  if (!recent.length) { list.innerHTML = '<p class="no-entries">No entries yet. Start your first reflection above.</p>'; return; }
  list.innerHTML = recent.map(e => entryCardHTML(e)).join('');
  list.querySelectorAll('.entry-card').forEach(c => c.addEventListener('click', () => openEntry(c.dataset.id)));
}

// ── GROUNDING ──
function setupGrounding() {
  let idx = Math.floor(Math.random() * GROUNDING.length);
  document.getElementById('grounding-text').textContent = GROUNDING[idx];
  document.getElementById('refresh-grounding').addEventListener('click', () => {
    idx = (idx + 1) % GROUNDING.length;
    const el = document.getElementById('grounding-text');
    el.style.opacity = 0;
    setTimeout(() => { el.textContent = GROUNDING[idx]; el.style.opacity = 1; }, 250);
  });
}

// ── NEW ENTRY ──
function resetNewEntry() {
  document.getElementById('journal-textarea').value = '';
  document.getElementById('word-count').textContent = '0 words';
  document.querySelectorAll('.mood-pill').forEach(p => p.classList.remove('selected'));
  state.selectedMoodEntry = ''; state.tags = [];
  document.getElementById('tags-container').innerHTML = '<input type="text" class="tag-input" id="tag-input" placeholder="Add a tag..." />';
  setupTagInput();
  document.getElementById('ai-response-card').classList.add('hidden');
  document.getElementById('ai-response-text').textContent = '';
  document.getElementById('ai-followup').classList.add('hidden');
  const prompt = state.currentPrompt || getRandomPrompt();
  document.getElementById('current-prompt').textContent = prompt;
  state.currentPrompt = '';
}
function getRandomPrompt() {
  const pool = PROMPTS[state.mood] || PROMPTS.default;
  return pool[Math.floor(Math.random() * pool.length)];
}
function setupNewEntry() {
  // Mood pills
  document.querySelectorAll('.mood-pill').forEach(p => {
    p.addEventListener('click', () => {
      document.querySelectorAll('.mood-pill').forEach(x => x.classList.remove('selected'));
      p.classList.add('selected'); state.selectedMoodEntry = p.dataset.mood;
      updatePromptForMood(p.dataset.mood);
    });
  });
  // New prompt btn
  document.getElementById('new-prompt-btn').addEventListener('click', () => {
    const mood = state.selectedMoodEntry || state.mood || 'default';
    const pool = PROMPTS[mood] || PROMPTS.default;
    const current = document.getElementById('current-prompt').textContent;
    let next = pool[Math.floor(Math.random() * pool.length)];
    let tries = 0; while (next === current && pool.length > 1 && tries < 5) { next = pool[Math.floor(Math.random() * pool.length)]; tries++; }
    document.getElementById('current-prompt').textContent = next;
  });
  // Use prompt
  document.getElementById('use-prompt-btn').addEventListener('click', () => {
    const prompt = document.getElementById('current-prompt').textContent;
    const ta = document.getElementById('journal-textarea');
    if (!ta.value.trim()) ta.value = ''; ta.focus();
  });
  // Word count
  document.getElementById('journal-textarea').addEventListener('input', () => {
    const words = document.getElementById('journal-textarea').value.trim().split(/\s+/).filter(w => w).length;
    document.getElementById('word-count').textContent = `${words} word${words !== 1 ? 's' : ''}`;
  });
  // Tags
  setupTagInput();
  // AI response
  document.getElementById('get-ai-response-btn').addEventListener('click', getAIResponse);
  // Save
  document.getElementById('save-entry-btn').addEventListener('click', saveEntry);
  // Delete
  document.getElementById('delete-entry-btn').addEventListener('click', deleteEntry);
}
function updatePromptForMood(mood) {
  const pool = PROMPTS[mood] || PROMPTS.default;
  document.getElementById('current-prompt').textContent = pool[Math.floor(Math.random() * pool.length)];
}
function setupTagInput() {
  const input = document.getElementById('tag-input');
  if (!input) return;
  input.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
      e.preventDefault(); addTag(input.value.trim().replace(',', '')); input.value = '';
    }
    if (e.key === 'Backspace' && !input.value && state.tags.length) {
      removeTag(state.tags[state.tags.length - 1]);
    }
  });
}
function addTag(tag) {
  if (!tag || state.tags.includes(tag) || state.tags.length >= 5) return;
  state.tags.push(tag); renderTags();
}
function removeTag(tag) {
  state.tags = state.tags.filter(t => t !== tag); renderTags();
}
function renderTags() {
  const container = document.getElementById('tags-container');
  const existing = [...container.querySelectorAll('.tag-chip')];
  existing.forEach(c => c.remove());
  state.tags.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = `${tag}<span class="tag-chip-remove" data-tag="${tag}">×</span>`;
    chip.querySelector('.tag-chip-remove').addEventListener('click', () => removeTag(tag));
    container.insertBefore(chip, document.getElementById('tag-input'));
  });
}

async function getAIResponse() {
  const text = document.getElementById('journal-textarea').value.trim();
  if (!text) { alert('Please write something first.'); return; }
  const btn = document.getElementById('get-ai-response-btn');
  btn.disabled = true; btn.textContent = 'Reflecting...';
  const card = document.getElementById('ai-response-card');
  const responseEl = document.getElementById('ai-response-text');
  const typingEl = document.getElementById('ai-typing');
  const followupEl = document.getElementById('ai-followup');
  card.classList.remove('hidden');
  typingEl.classList.remove('hidden');
  responseEl.textContent = ''; followupEl.classList.add('hidden');
  const mood = state.selectedMoodEntry || state.mood || '';
  const messages = [
    { role: 'system', content: `You are Journea, a compassionate journaling companion for overthinkers. Your tone is warm, gentle, non-judgmental. Keep responses to 2-3 short paragraphs. End with a short follow-up question prefixed with **Follow-up:**. User's current mood: ${mood}.` },
    { role: 'user', content: text },
  ];
  const response = await callAzureAI(messages);
  typingEl.classList.add('hidden');
  const parts = response.split('**Follow-up:**');
  responseEl.textContent = parts[0].trim();
  if (parts[1]) {
    followupEl.classList.remove('hidden');
    document.getElementById('followup-question').textContent = parts[1].trim();
  }
  btn.disabled = false; btn.textContent = '✦ Get AI Reflection';
}

function saveEntry() {
  const text = document.getElementById('journal-textarea').value.trim();
  if (!text) { alert('Please write something before saving.'); return; }
  const entry = {
    id: Date.now().toString(),
    date: Date.now(),
    text,
    mood: state.selectedMoodEntry || state.mood || '',
    prompt: document.getElementById('current-prompt').textContent,
    tags: [...state.tags],
    aiResponse: document.getElementById('ai-response-text').textContent || '',
    aiFollowup: document.getElementById('followup-question')?.textContent || '',
  };
  state.entries.unshift(entry);
  // Update streak
  updateStreak();
  saveState();
  navigate('journal');
}
function deleteEntry() {
  if (!state.currentEntryId) return;
  if (!confirm('Delete this entry?')) return;
  state.entries = state.entries.filter(e => e.id !== state.currentEntryId);
  state.currentEntryId = null; saveState(); navigate('journal');
}
function updateStreak() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dates = state.entries.map(e => { const d = new Date(e.date); d.setHours(0, 0, 0, 0); return d.getTime(); });
  const unique = [...new Set(dates)].sort((a, b) => b - a);
  let streak = 0; let check = today.getTime();
  for (const d of unique) {
    if (d === check) { streak++; check -= 86400000; }
    else if (d === check + 86400000) { check = d - 86400000; streak++; }
    else break;
  }
  state.streak = streak; saveState();
}

// ── JOURNAL PAGE ──
function renderJournalPage() {
  // Reset filters
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  // Reset search
  const searchInput = document.getElementById('journal-search');
  if (searchInput) searchInput.value = '';
  
  // Reset to List view (ensure it's not stuck on Calendar)
  if (typeof switchJournalView === 'function') switchJournalView('list');

  // Render all entries
  renderJournalEntries(state.entries);
  setupJournalSearch();

  // Update entry count
  const countEl = document.getElementById('journal-entry-count');
  if (countEl) {
    const n = state.entries.length;
    countEl.textContent = n > 0 ? `${n} entr${n === 1 ? 'y' : 'ies'} so far` : '';
  }
}
function setupJournal() {
  document.getElementById('journal-search').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    const filtered = state.entries.filter(en => en.text.toLowerCase().includes(q) || en.tags.some(t => t.toLowerCase().includes(q)));
    renderJournalEntries(filtered);
  });
  document.getElementById('mood-filter-row').querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const isCurrentlyActive = pill.classList.contains('active');
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      
      if (isCurrentlyActive) {
        // Toggle off: show all
        renderJournalEntries(state.entries);
      } else {
        pill.classList.add('active');
        const f = pill.dataset.filter;
        const filtered = state.entries.filter(e => e.mood === f);
        renderJournalEntries(filtered);
      }
    });
  });
}
function setupJournalSearch() { }
function renderJournalEntries(entries) {
  const list = document.getElementById('journal-entries-list');
  if (!entries.length) { list.innerHTML = '<p class="no-entries">No entries found.</p>'; return; }
  const sorted = [...entries].sort((a, b) => b.date - a.date);
  list.innerHTML = sorted.map(e => entryCardHTML(e)).join('');
  list.querySelectorAll('.entry-card').forEach(c => c.addEventListener('click', () => openEntry(c.dataset.id)));
}
function entryCardHTML(e) {
  const d = new Date(e.date);
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const preview = e.text.replace(/\n/g, ' ').slice(0, 120) + (e.text.length > 120 ? '...' : '');
  const moodEmojis = { calm: '😌', anxious: '😰', sad: '😔', hopeful: '🌤', overwhelmed: '😵', grateful: '🙏', angry: '😤', content: '☀️' };
  const moodTag = e.mood ? `<span class="entry-mood-tag">${moodEmojis[e.mood] || ''} ${e.mood}</span>` : '';
  const tags = e.tags && e.tags.length ? `<div class="entry-tags">${e.tags.map(t => `<span class="entry-tag">${t}</span>`).join('')}</div>` : '';
  return `<div class="entry-card" data-id="${e.id}" id="entry-card-${e.id}">
    <div class="entry-card-left">
      <div class="entry-meta"><span class="entry-date-label">${dateStr}</span>${moodTag}</div>
      <div class="entry-preview">${preview}</div>${tags}
    </div>
    <span class="entry-arrow">›</span>
  </div>`;
}
function openEntry(id) {
  const entry = state.entries.find(e => e.id === id);
  if (!entry) return;
  state.currentEntryId = id;
  const d = new Date(entry.date);
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const moodEmojis = { calm: '😌', anxious: '😰', sad: '😔', hopeful: '🌤', overwhelmed: '😵', grateful: '🙏', angry: '😤', content: '☀️' };
  const aiSection = entry.aiResponse ? `<div class="detail-ai-section"><p class="detail-ai-label">✦ Journea responded</p><p class="detail-ai-text">${entry.aiResponse}</p>${entry.aiFollowup ? `<p class="detail-ai-text" style="margin-top:.75rem;font-style:italic;color:var(--text3)">Follow-up: ${entry.aiFollowup}</p>` : ''}</div>` : '';
  const tags = entry.tags && entry.tags.length ? `<div class="entry-tags" style="margin-bottom:1rem">${entry.tags.map(t => `<span class="entry-tag">${t}</span>`).join('')}</div>` : '';
  document.getElementById('entry-detail-content').innerHTML = `
    <div class="detail-header">
      <p class="detail-date">${dateStr}</p>
      ${entry.mood ? `<span class="detail-mood">${moodEmojis[entry.mood] || ''} ${entry.mood}</span>` : ''}
    </div>
    <p class="detail-body">${entry.text}</p>
    ${tags}${aiSection}`;
  navigate('entry-detail');
}

// ── INSIGHTS PAGE ──
function renderInsightsPage() {
  renderMoodChart();
  renderStreak();
  renderWeeklyInsight();
  // renderThemesCloud(); // Recurring Themes hidden
}
function renderMoodChart() {
  const counts = { calm: 0, anxious: 0, sad: 0, hopeful: 0, overwhelmed: 0, grateful: 0, angry: 0, content: 0 };
  state.entries.forEach(e => { if (e.mood && counts[e.mood] !== undefined) counts[e.mood]++; });
  const max = Math.max(...Object.values(counts), 1);
  const moodEmojis = { calm: '😌 Calm', anxious: '😰 Anxious', sad: '😔 Sad', hopeful: '🌤 Hopeful', overwhelmed: '😵 Overwhelmed', grateful: '🙏 Grateful', angry: '😤 Frustrated', content: '☀️ Content' };
  const chart = document.getElementById('mood-chart');
  chart.innerHTML = Object.entries(counts).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([mood, count]) => `
    <div class="mood-bar-row">
      <span class="mood-bar-label">${moodEmojis[mood] || mood}</span>
      <div class="mood-bar-track"><div class="mood-bar-fill" style="width:${(count / max) * 100}%"></div></div>
      <span class="mood-bar-count">${count}</span>
    </div>`).join('') || '<p style="color:var(--text3);font-size:.85rem">No entries yet.</p>';
}
function renderStreak() {
  updateStreak();
  document.getElementById('streak-count').textContent = state.streak || 0;
  const s = state.streak || 0;
  document.getElementById('streak-sub').textContent = s === 0 ? 'Write your first entry to start your streak.' : s < 3 ? 'Great start — keep the momentum going.' : s < 7 ? 'You\'re building something meaningful.' : 'You\'re on a roll. Keep going.';
}
async function renderWeeklyInsight() {
  const body = document.getElementById('weekly-insight-body');
  const weekEntries = state.entries.filter(e => Date.now() - e.date < 7 * 24 * 3600 * 1000);
  const countEl = document.getElementById('wi-entry-count');
  if (countEl) countEl.textContent = weekEntries.length ? `${weekEntries.length} entr${weekEntries.length === 1 ? 'y' : 'ies'}` : '';
  if (weekEntries.length < 2) { body.innerHTML = '<p class="insight-placeholder">Write at least 2 journal entries this week to unlock your AI insight.</p>'; return; }
  if (state.weeklyInsightData) { renderStructuredInsight(state.weeklyInsightData); return; }
  body.innerHTML = '<p class="insight-placeholder">Click \'Generate Weekly Insights\' to analyse this week.</p>';
}
async function generateWeeklyInsight() {
  const btn = document.getElementById('generate-insights-btn');
  btn.disabled = true; btn.textContent = 'Generating...';
  const weekEntries = state.entries.filter(e => Date.now() - e.date < 7 * 24 * 3600 * 1000);
  if (weekEntries.length < 2) { alert('Write at least 2 entries this week first.'); btn.disabled = false; btn.textContent = '✦ Generate Weekly Insights'; return; }
  const combined = weekEntries.map(e => `[${new Date(e.date).toLocaleDateString()}] Mood: ${e.mood || 'unknown'}\n${e.text}`).join('\n\n---\n\n');
  const messages = [
    {
      role: 'system', content: `You are Journea, a compassionate AI journaling companion. Analyse the journal entries and return ONLY a valid JSON object with these fields:
{
  "prose": "2-3 paragraph warm, supportive summary of the week",
  "moodTrend": "one sentence about how mood fluctuated or evolved",
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "themes": ["theme phrase 1", "theme phrase 2", "theme phrase 3"],
  "triggers": ["trigger phrase 1", "trigger phrase 2"]
}
Return JSON only. No markdown, no explanation.`},
    { role: 'user', content: `Journal entries this week:\n\n${combined}` },
  ];
  const raw = await callAzureAI(messages);
  let data;
  try {
    const jsonStr = raw.replace(/```json|```/g, '').trim();
    data = JSON.parse(jsonStr);
  } catch (e) {
    // fallback: show raw text
    data = { prose: raw, moodTrend: '', emotions: [], themes: [], triggers: [] };
  }
  state.weeklyInsightData = data; state.weeklyInsight = raw; saveState();
  renderStructuredInsight(data);
  // also update entry count
  const countEl = document.getElementById('wi-entry-count');
  if (countEl) countEl.textContent = `${weekEntries.length} entr${weekEntries.length === 1 ? 'y' : 'ies'}`;
  btn.disabled = false; btn.textContent = '✦ Generate Weekly Insights';
}
function renderStructuredInsight(data) {
  const body = document.getElementById('weekly-insight-body');
  const emotionTags = data.emotions && data.emotions.length
    ? data.emotions.map(e => `<span class="wi-tag wi-tag-emotion">${e}</span>`).join('')
    : '<span class="wi-empty">—</span>';
  const themeTags = data.themes && data.themes.length
    ? data.themes.map(t => `<span class="wi-theme-item">${t}</span>`).join('')
    : '<span class="wi-empty">—</span>';
  const triggerTags = data.triggers && data.triggers.length
    ? data.triggers.map(t => `<span class="wi-tag wi-tag-trigger">${t}</span>`).join('')
    : '<span class="wi-empty">—</span>';
  const trendBlock = data.moodTrend
    ? `<div class="wi-trend-callout"><span class="wi-trend-icon">↗</span><p>${data.moodTrend}</p></div>`
    : '';
  body.innerHTML = `
    <p class="wi-prose">${(data.prose || '').replace(/\n/g, '<br/>')}</p>
    ${trendBlock}
    <div class="wi-columns">
      <div class="wi-col">
        <div class="wi-col-header"><span class="wi-col-icon">♡</span> EMOTIONS</div>
        <div class="wi-col-tags">${emotionTags}</div>
      </div>
      <div class="wi-col">
        <div class="wi-col-header"><span class="wi-col-icon">▦</span> THEMES</div>
        <div class="wi-col-themes">${themeTags}</div>
      </div>
      <div class="wi-col">
        <div class="wi-col-header"><span class="wi-col-icon">⚠</span> TRIGGERS</div>
        <div class="wi-col-tags">${triggerTags}</div>
      </div>
    </div>`;
}
function renderThemesCloud() {
  const cloud = document.getElementById('themes-cloud');
  const stopwords = new Set(['i', 'a', 'the', 'and', 'to', 'in', 'is', 'it', 'of', 'my', 'that', 'was', 'for', 'with', 'this', 'be', 'are', 'on', 'have', 'had', 'at', 'so', 'an', 'but', 'not', 'me', 'we', 'he', 'she', 'they', 'do', 'did', 'has', 'can', 'just', 'what', 'like', 'feel', 'felt', 'know', 'want', 'need', 'think', 'thought']);
  const wordCount = {};
  state.entries.forEach(e => {
    e.text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).forEach(w => {
      if (w.length > 3 && !stopwords.has(w)) wordCount[w] = (wordCount[w] || 0) + 1;
    });
  });
  const sorted = Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 20);
  if (!sorted.length) { cloud.innerHTML = '<p style="color:var(--text3);font-size:.85rem">Write more entries to surface recurring themes.</p>'; return; }
  const max = sorted[0][1];
  const colors = ['rgba(94,234,212,.15)', 'rgba(167,139,250,.15)', 'rgba(251,191,36,.1)', 'rgba(244,114,182,.1)'];
  const tcolors = ['var(--teal)', 'var(--accent2)', '#fbbf24', '#f472b6'];
  cloud.innerHTML = sorted.map(([word, count], i) => {
    const size = 0.78 + ((count / max) * 0.5);
    const ci = i % 4;
    return `<span class="theme-tag" style="font-size:${size}rem;background:${colors[ci]};color:${tcolors[ci]};border:1px solid ${tcolors[ci]}33">${word}</span>`;
  }).join('');
}

// ── HABITS PAGE ──
function renderHabitsPage() {
  const list = document.getElementById('habits-list');
  if (!state.habits || !state.habits.length) { list.innerHTML = '<p class="empty-habits">No habits yet. Add one above or use the AI suggestion below.</p>'; renderHabitSuggestion(); return; }
  const today = new Date().toDateString();
  list.innerHTML = state.habits.map((h, i) => `
    <div class="habit-card" id="habit-card-${i}">
      <div class="habit-check ${h.doneToday === today ? 'done' : ''}" id="habit-check-${i}" data-idx="${i}">${h.doneToday === today ? '✓' : ''}</div>
      <div class="habit-info">
        <div class="habit-name">${h.name}</div>
        <div class="habit-freq">${h.freq} ${h.time ? '· ' + h.time : ''}</div>
      </div>
      <span class="habit-streak">${h.streak || 0} day streak</span>
      <button class="habit-delete" id="habit-del-${i}" data-idx="${i}">✕</button>
    </div>`).join('');
  list.querySelectorAll('.habit-check').forEach(btn => {
    btn.addEventListener('click', () => toggleHabit(parseInt(btn.dataset.idx)));
  });
  list.querySelectorAll('.habit-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteHabit(parseInt(btn.dataset.idx)));
  });
  renderHabitSuggestion();
}
function toggleHabit(idx) {
  const h = state.habits[idx];
  const today = new Date().toDateString();
  if (h.doneToday === today) { h.doneToday = ''; if (h.streak > 0) h.streak--; }
  else { h.doneToday = today; h.streak = (h.streak || 0) + 1; }
  saveState(); renderHabitsPage();
}
function deleteHabit(idx) {
  if (!confirm('Remove this habit?')) return;
  state.habits.splice(idx, 1); saveState(); renderHabitsPage();
}
async function renderHabitSuggestion() {
  const el = document.getElementById('habit-suggestion-text');
  const btn = document.getElementById('add-suggested-habit-btn');
  const weekEntries = state.entries.filter(e => Date.now() - e.date < 7 * 24 * 3600 * 1000);
  if (weekEntries.length < 1) {
    const rand = HABIT_SUGGESTIONS[Math.floor(Math.random() * HABIT_SUGGESTIONS.length)];
    state.habitSuggestion = rand;
    el.textContent = `Try adding: "${rand.name}" — a gentle daily habit for overthinkers.`;
    btn.style.display = 'inline-block'; return;
  }
  const messages = [
    { role: 'system', content: 'You are Journea. Based on these journal entries, suggest ONE short, gentle habit (max 8 words). Return only the habit name, nothing else.' },
    { role: 'user', content: weekEntries.map(e => `Mood:${e.mood} — ${e.text.slice(0, 200)}`).join('\n') },
  ];
  const suggestion = await callAzureAI(messages);
  const habitName = suggestion.replace(/["*]/g, '').trim().split('\n')[0].slice(0, 60);
  state.habitSuggestion = { name: habitName, freq: 'daily' };
  el.textContent = `Based on your recent entries, try: "${habitName}"`;
  btn.style.display = 'inline-block';
}
function setupHabits() {
  document.getElementById('add-habit-btn').addEventListener('click', () => {
    document.getElementById('habit-modal-overlay').classList.remove('hidden');
  });
  document.getElementById('habit-modal-close').addEventListener('click', closeHabitModal);
  document.getElementById('habit-modal-cancel').addEventListener('click', closeHabitModal);
  document.getElementById('habit-modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('habit-modal-overlay')) closeHabitModal();
  });
  document.querySelectorAll('.freq-pill').forEach(p => {
    p.addEventListener('click', () => {
      document.querySelectorAll('.freq-pill').forEach(x => x.classList.remove('active'));
      p.classList.add('active');
    });
  });
  document.getElementById('habit-modal-save').addEventListener('click', saveHabit);
  document.getElementById('add-suggested-habit-btn').addEventListener('click', addSuggestedHabit);
}
function closeHabitModal() {
  document.getElementById('habit-modal-overlay').classList.add('hidden');
  document.getElementById('habit-name-input').value = '';
  document.getElementById('habit-time-input').value = '';
  document.querySelectorAll('.freq-pill').forEach(p => p.classList.remove('active'));
  document.getElementById('freq-daily').classList.add('active');
}
function saveHabit() {
  const name = document.getElementById('habit-name-input').value.trim();
  if (!name) { alert('Please enter a habit name.'); return; }
  const freq = document.querySelector('.freq-pill.active')?.dataset.freq || 'daily';
  const time = document.getElementById('habit-time-input').value || '';
  if (!state.habits) state.habits = [];
  state.habits.push({ name, freq, time, streak: 0, doneToday: '' });
  saveState(); closeHabitModal(); renderHabitsPage();
}
function addSuggestedHabit() {
  if (!state.habitSuggestion) return;
  if (!state.habits) state.habits = [];
  state.habits.push({ ...state.habitSuggestion, streak: 0, doneToday: '' });
  saveState(); renderHabitsPage();
}
function setupInsights() {
  document.getElementById('generate-insights-btn').addEventListener('click', generateWeeklyInsight);
}

// ── VOICE INPUT (Web Speech API) ──
function setupVoiceInput() {
  const micBtn = document.getElementById('mic-btn');
  const micIcon = document.getElementById('mic-icon');
  const voiceStatus = document.getElementById('voice-status');
  const voiceWave = document.getElementById('voice-wave');
  const voiceBar = document.getElementById('voice-bar');
  const textarea = document.getElementById('journal-textarea');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    micBtn.disabled = true;
    micBtn.title = 'Voice input not supported in this browser';
    voiceStatus.innerHTML = '<span class="voice-unsupported">Voice not supported — try Chrome or Edge</span>';
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  let isListening = false;
  let interimStart = 0;

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add('active');
    micIcon.textContent = '⏹';
    voiceBar.classList.add('listening');
    voiceStatus.textContent = 'Listening… speak freely';
    voiceWave.classList.remove('hidden');
    // mark where interim text begins
    interimStart = textarea.value.length;
  };

  recognition.onresult = (event) => {
    let interim = '';
    let finalText = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText += transcript + ' ';
      } else {
        interim = transcript;
      }
    }

    // Build the textarea value: base + final + interim preview
    const base = textarea.value.slice(0, interimStart);
    const committed = textarea.value.slice(interimStart).replace(/\[.*?\]/g, '');
    if (finalText) {
      textarea.value = base + committed + finalText;
      interimStart = textarea.value.length;
      voiceStatus.textContent = 'Got it — keep talking or stop';
    } else if (interim) {
      textarea.value = base + committed + `[${interim}]`;
    }

    // Update word count
    const words = textarea.value.replace(/\[.*?\]/g, '').trim().split(/\s+/).filter(w => w).length;
    document.getElementById('word-count').textContent = `${words} word${words !== 1 ? 's' : ''}`;
  };

  recognition.onerror = (event) => {
    if (event.error === 'not-allowed') {
      voiceStatus.textContent = 'Microphone access denied — check browser permissions';
    } else if (event.error === 'no-speech') {
      voiceStatus.textContent = 'No speech detected — try again';
    } else {
      voiceStatus.textContent = `Error: ${event.error}`;
    }
    stopListening();
  };

  recognition.onend = () => {
    if (isListening) {
      // auto-restart if still supposed to be listening
      try { recognition.start(); } catch (e) { stopListening(); }
    }
  };

  function stopListening() {
    isListening = false;
    recognition.stop();
    micBtn.classList.remove('active');
    micIcon.textContent = '🎙️';
    voiceBar.classList.remove('listening');
    voiceWave.classList.add('hidden');
    // clean up any leftover interim brackets
    textarea.value = textarea.value.replace(/\[.*?\]/g, '').trimEnd() + (textarea.value.endsWith(' ') ? '' : ' ');
    textarea.value = textarea.value.trimEnd();
    const words = textarea.value.trim().split(/\s+/).filter(w => w).length;
    document.getElementById('word-count').textContent = `${words} word${words !== 1 ? 's' : ''}`;
    voiceStatus.textContent = words > 0 ? `${words} words captured — click mic to continue` : 'Click the mic to speak your thoughts';
  }

  micBtn.addEventListener('click', () => {
    if (isListening) {
      stopListening();
    } else {
      try {
        recognition.start();
      } catch (e) {
        voiceStatus.textContent = 'Could not start — try clicking again';
      }
    }
  });
}

// init voice after DOM ready
document.addEventListener('DOMContentLoaded', setupVoiceInput);

// ── JOURNAL CALENDAR VIEW ──
let calViewDate = new Date();

function setupCalendarView() {
  document.getElementById('view-list-btn').addEventListener('click', () => switchJournalView('list'));
  document.getElementById('view-cal-btn').addEventListener('click', () => switchJournalView('calendar'));
  document.getElementById('cal-prev').addEventListener('click', () => {
    calViewDate.setMonth(calViewDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', () => {
    calViewDate.setMonth(calViewDate.getMonth() + 1);
    renderCalendar();
  });
}

function switchJournalView(view) {
  const listView = document.getElementById('journal-list-view');
  const calView = document.getElementById('journal-calendar-view');
  const listBtn = document.getElementById('view-list-btn');
  const calBtn = document.getElementById('view-cal-btn');
  if (view === 'calendar') {
    listView.classList.add('hidden');
    calView.classList.remove('hidden');
    listBtn.classList.remove('active');
    calBtn.classList.add('active');
    calViewDate = new Date();
    renderCalendar();
  } else {
    calView.classList.add('hidden');
    listView.classList.remove('hidden');
    calBtn.classList.remove('active');
    listBtn.classList.add('active');
  }
}

function renderCalendar() {
  const year = calViewDate.getFullYear();
  const month = calViewDate.getMonth();
  const label = calViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  document.getElementById('cal-month-label').textContent = label;

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const moodEmojis = { calm: '😌', anxious: '😰', sad: '😔', hopeful: '🌤', overwhelmed: '😵', grateful: '🙏', angry: '😤', content: '☀️' };

  // Build a map: dateString -> [entries]
  const entryMap = {};
  state.entries.forEach(e => {
    const d = new Date(e.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate();
      if (!entryMap[key]) entryMap[key] = [];
      entryMap[key].push(e);
    }
  });

  let html = '';
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="cal-cell empty"></div>';
  }
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    const entries = entryMap[day] || [];
    const hasEntry = entries.length > 0;
    let innerContent = '';
    if (hasEntry) {
      const lastEntry = entries[0];
      const emoji = moodEmojis[lastEntry.mood] || '📝';
      innerContent = `<div class="cal-mood-emoji">${emoji}</div>`;
    }
    const classes = ['cal-cell', hasEntry ? 'has-entry' : '', isToday ? 'is-today' : ''].filter(Boolean).join(' ');
    const entryId = hasEntry ? `data-entryid="${entries[0].id}"` : '';
    html += `<div class="${classes}" ${entryId} id="cal-day-${day}">
      <span class="cal-day-num">${day}</span>
      ${innerContent}
    </div>`;
  }

  const grid = document.getElementById('cal-grid');
  grid.innerHTML = html;

  // Click on a day with an entry → open it
  grid.querySelectorAll('.cal-cell.has-entry').forEach(cell => {
    cell.addEventListener('click', () => {
      const id = cell.dataset.entryid;
      if (id) openEntry(id);
    });
  });
}

document.addEventListener('DOMContentLoaded', setupCalendarView);
