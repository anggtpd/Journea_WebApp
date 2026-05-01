export const getDummyData = () => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const entries = [
    {
      id: 'd1',
      date: now - dayMs * 0 - 3600000, // today, 1 hour ago
      mood: 'calm',
      prompt: 'What small moment brought you peace today?',
      text: 'Sitting with my morning coffee while the house was still quiet. Just watching the steam rise. I felt surprisingly okay for the first time in a few days.',
      tags: ['morning', 'coffee', 'peace'],
      aiResponse: "It sounds like you found a beautiful pocket of stillness. Those quiet morning moments can be so anchoring. Notice how your body feels when you recall that steam rising — that peace is yours.",
      aiFollowup: "How can you bring a tiny piece of that morning calm into the rest of your day?"
    },
    {
      id: 'd2',
      date: now - dayMs * 1 - 7200000, // yesterday
      mood: 'anxious',
      prompt: 'What is the one worry taking up the most space right now?',
      text: 'I keep thinking about the presentation next week. My chest feels tight and I can\'t seem to focus on the prep work because I keep imagining everything going wrong.',
      tags: ['work', 'presentation', 'worry'],
      aiResponse: "It makes complete sense that you're feeling anxious — presentations carry a lot of pressure. Remember that this anxiety is just your brain trying to protect you by preparing for every outcome. You don't have to fight it, just acknowledge it's there.",
      aiFollowup: "What is one small, manageable step you can take today to prepare, without trying to do it all?"
    },
    {
      id: 'd3',
      date: now - dayMs * 2, // 2 days ago
      mood: 'overwhelmed',
      prompt: 'List every single thing on your mind — just get it out of your head.',
      text: 'Too many emails, haven\'t called mom back, the car needs an oil change, I feel behind on the project, and the house is a mess. It\'s just a lot of noise.',
      tags: ['chores', 'work', 'noise'],
      aiResponse: "That is a lot of noise to carry around in your head. Getting it down on paper is a great first step to detangling it. You don't have to solve all of these right now. Breathe.",
      aiFollowup: "If you could only cross off ONE thing from this list today to feel slightly lighter, what would it be?"
    },
    {
      id: 'd4',
      date: now - dayMs * 3 - 10000000, // 3 days ago
      mood: 'hopeful',
      prompt: 'What feels possible today that didn\'t yesterday?',
      text: 'I finally had a breakthrough on the code I was stuck on. It made me realize I actually am getting better at this. Maybe I can actually finish the app by the end of the month.',
      tags: ['coding', 'progress', 'confidence'],
      aiResponse: "That's a wonderful breakthrough! Recognizing your own growth is such a powerful feeling. It's okay to let yourself feel proud of the hard work you've put in to get to this point.",
      aiFollowup: "What is a small way you can celebrate this win today?"
    },
    {
      id: 'd5',
      date: now - dayMs * 4,
      mood: 'sad',
      prompt: 'What loss, big or small, are you sitting with today?',
      text: 'I miss my old routine. Ever since moving, things just feel off and I feel disconnected from my friends. It\'s just a lonely day.',
      tags: ['lonely', 'change'],
      aiResponse: "Transitions are incredibly hard, even when they're positive. It's completely valid to grieve the comfort of your old routine and the proximity of your friends. Be gentle with yourself as you navigate this new space.",
      aiFollowup: "Is there a small, comforting ritual from your old routine that you could bring into your new space?"
    },
    {
      id: 'd6',
      date: now - dayMs * 5 - 4000000,
      mood: 'calm',
      prompt: 'Describe your day in three words — then expand on each.',
      text: 'Slow, steady, quiet. I didn\'t do much, just read a book and took a walk. It was exactly what I needed.',
      tags: ['rest', 'reading', 'walk'],
      aiResponse: "Slow, steady, and quiet sounds deeply restorative. It's wonderful that you recognized what you needed and allowed yourself to simply rest. That in itself is an accomplishment.",
      aiFollowup: "How can you protect this feeling of restfulness as you move into tomorrow?"
    },
    {
      id: 'd7',
      date: now - dayMs * 8, // 8 days ago (last week)
      mood: 'anxious',
      prompt: 'What would you tell a friend feeling exactly what you feel?',
      text: 'I would tell them that they are doing enough. That it is okay to be tired. I just wish I could believe it for myself.',
      tags: ['tired', 'self-compassion'],
      aiResponse: "You have so much compassion for others. It's often so much harder to direct that same kindness inward. But the truth you would offer a friend is the exact truth you deserve to hear right now: you are doing enough.",
      aiFollowup: "Can you take a deep breath and repeat your own advice back to yourself right now?"
    }
  ];

  const habits = [
    { name: '5-minute breathing', freq: 'daily', time: 'Morning', streak: 4, doneToday: new Date().toDateString() },
    { name: 'Evening brain dump', freq: 'daily', time: 'Night', streak: 2, doneToday: '' },
    { name: 'Walk outside', freq: 'weekdays', time: 'Afternoon', streak: 8, doneToday: new Date().toDateString() }
  ];

  return { entries, habits };
};
