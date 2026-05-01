# Journea (Reflect AI)

Journea is a minimalist, distraction-free journaling application built with React and Vite. It is designed specifically for overthinkers, providing a calm space to externalize thoughts with the help of a compassionate AI journaling companion.

![Journea Screenshot](public/vite.svg) *(Replace with actual app screenshot)*

## ✦ Features

- **Guided Daily Reflections:** Select your current mood to receive tailored, gentle journaling prompts.
- **AI-Powered Companionship:** Uses Azure OpenAI (`o4-mini` / `gpt-4o-mini`) to read your daily entries and offer warm, non-judgmental reflections and follow-up questions.
- **Weekly Insights:** Automatically generates a beautiful, structured summary of your past 7 days, analyzing mood trends, recurring themes, and triggers.
- **Mindful Moments:** Generate short, randomized, AI-powered grounding exercises at the click of a button.
- **Voice Input:** Native speech-to-text integration for hands-free, stream-of-consciousness journaling.
- **Habit Suggestions:** Based on your recent entries, the AI can suggest one small, gentle habit to focus on.
- **Privacy First:** All your journaling data is stored completely locally in your browser's `localStorage`.
- **Graceful Offline Mode:** Fully functional even without an API key, falling back to a set of pre-written, thoughtful mock responses.

## 🚀 Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Vanilla CSS (Minimalist, dark-mode focused aesthetic)
- **State Management:** React Context API
- **AI Integration:** Azure OpenAI REST API

## 🛠️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anggtpd/Journea_WebApp.git
   cd Journea_WebApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Azure OpenAI:**
   Open `src/config.js` and replace the placeholder values with your actual Azure credentials:
   ```javascript
   export const AZURE_CONFIG = {
     endpoint: "https://your-resource-name.openai.azure.com/",
     apiKey: "your_azure_api_key", 
     deploymentName: "gpt-4o-mini", // Or your custom deployment name (e.g., o4-mini)
     apiVersion: "2024-12-01-preview",
   };
   ```
   *Note: If you leave the API key blank or keep it as `your_key`, the app will automatically enter offline simulation mode.*

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## 📁 Project Structure

```text
src/
├── context/         # Global state management (AppContext.jsx)
├── lib/             # Utility functions
│   ├── azureAi.js   # Azure OpenAI API integration and fallback simulation logic
│   ├── constants.js # Hardcoded prompt pools, grounding texts, and emojis
│   └── dummyData.js # Utility for generating fake journal entries for testing
├── pages/           # React page components
│   ├── Today.jsx    # Dashboard, recent entries, mindful moment
│   ├── NewEntry.jsx # The core writing interface with voice & AI reflection
│   ├── Journal.jsx  # Calendar view and history filtering
│   ├── Insights.jsx # Weekly AI summary generation
│   ├── Habits.jsx   # AI habit suggestion
│   └── EntryDetail.jsx
├── App.jsx          # Main routing and Sidebar layout
├── index.css        # Global design system and custom UI components
└── main.jsx         # React DOM entry point
```

## 🔐 Security Note
Currently, the Azure API key is stored client-side in `src/config.js` for development purposes. For production deployments, it is highly recommended to proxy the AI requests through a lightweight backend to keep your API keys secure.

## 📄 License
MIT License
