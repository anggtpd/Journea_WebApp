import { AZURE_CONFIG } from '../../config.js';

export async function callAzureAI(messages) {
  const { endpoint, apiKey, deploymentName, apiVersion, openai } = AZURE_CONFIG;
  
  // Try Azure if key is available and doesn't look like a placeholder
  if (apiKey && !apiKey.includes('your-')) { 
    try {
      const baseUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
      const url = `${baseUrl}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
        body: JSON.stringify({ messages, max_completion_tokens: 800 })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '';
        if (content.trim()) return content;
      }
      
      console.error('Azure AI failed, trying OpenAI fallback...');
    } catch (e) {
      console.error('Azure AI Exception, trying OpenAI fallback:', e);
    }
  }

  // Fallback to OpenAI if key is available
  if (openai?.apiKey && !openai.apiKey.includes('your_')) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${openai.apiKey}` 
        },
        body: JSON.stringify({ 
          model: openai.model,
          messages, 
          max_tokens: 800 
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || simulateAI(messages);
      }
      console.error('OpenAI API failed:', await res.text());
    } catch (e) {
      console.error('OpenAI Exception:', e);
    }
  }

  return simulateAI(messages);
}

function simulateAI(messages) {
  const isJSON = messages.some(m => m.content.includes('JSON'));
  if (isJSON) {
    return JSON.stringify({
      prose: "You've had a thoughtful week, navigating both anxiety and moments of deep calm. It takes courage to externalize these feelings.",
      moodTrend: "Your mood started anxious but gradually settled into a steadier calm.",
      emotions: ["Anxious", "Calm", "Overwhelmed"],
      themes: ["Work stress", "Seeking rest", "Self-compassion"],
      triggers: ["Deadlines", "Quiet mornings"]
    });
  }

  const isHabit = messages.some(m => m.content.includes('suggest ONE short, gentle habit'));
  if (isHabit) {
    const habits = [
      "5-minute mindful breathing",
      "Write 3 things you're grateful for",
      "A short walk without your phone",
      "Drink a glass of water upon waking"
    ];
    return habits[Math.floor(Math.random() * habits.length)];
  }

  const isMindful = messages.some(m => m.content.includes('calming mindful moment'));
  if (isMindful) {
    const moments = [
      "Notice three sounds around you. Let them anchor you to this exact moment.",
      "Soften your gaze. You don't need to have everything figured out right now.",
      "Take a long, slow breath in. And a longer, slower breath out."
    ];
    return moments[Math.floor(Math.random() * moments.length)];
  }


  const responses = [
    "What you've written shows real courage. Overthinkers often mistake rumination for reflection — but what you're doing here is different. This is you choosing to understand yourself rather than judge yourself. That matters.\n\n**Follow-up:** What would it feel like to be just 10% kinder to yourself today?",
    "There's a lot of weight in these words, and you're carrying it thoughtfully. The fact that you're naming it — giving it shape — means it has less power over you than it did five minutes ago.\n\n**Follow-up:** What's one tiny thing that felt okay today, even in the middle of all this?",
    "Reading this, I notice you're holding a lot. That's okay. You don't have to solve everything right now. Sometimes just externalizing the swirl is enough for today.\n\n**Follow-up:** If your feelings had a temperature right now, what would it be?",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
