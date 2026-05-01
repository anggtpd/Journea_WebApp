export const QUOTES = [
  { t: '"You don\'t have to control your thoughts. You just have to stop letting them control you."', a: 'Dan Millman' },
  { t: '"Almost everything will work again if you unplug it for a few minutes, including you."', a: 'Anne Lamott' },
  { t: '"Feelings are just visitors, let them come and go."', a: 'Mooji' },
  { t: '"You are allowed to be both a masterpiece and a work in progress."', a: 'Sophia Bush' },
];

export const GROUNDING = [
  'Take a slow breath. Notice five things you can see around you right now. You are here. You are safe.',
  'Feel your feet on the ground. You are anchored. The storm is above you, but you are rooted.',
  'Unclench your jaw. Drop your shoulders. Let yourself take up space right here, right now.',
  'Put your hand on your chest. Feel your heartbeat. This moment is real and you are in it.',
];

export const PROMPTS = {
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

export const HABIT_SUGGESTIONS = [
  { name: '5-min morning breathing', freq: 'daily' },
  { name: 'Evening brain dump journaling', freq: 'daily' },
  { name: 'Midday 2-min grounding check-in', freq: 'weekdays' },
  { name: 'Screen-free wind-down (30 min before bed)', freq: 'daily' },
  { name: 'Gratitude list (3 things)', freq: 'daily' },
  { name: 'Mindful walk without phone', freq: '3x' },
];

export const MOOD_EMOJIS = { calm: '😌', anxious: '😰', sad: '😔', hopeful: '🌤', overwhelmed: '😵', grateful: '🙏', angry: '😤', content: '☀️' };
