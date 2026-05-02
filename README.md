# Journea (Reflect AI)

Journea is a minimalist, distraction-free journaling application built with React and Vite. It is designed specifically for overthinkers, providing a calm space to externalize thoughts with the help of a compassionate AI journaling companion.


<img width="1470" height="923" alt="image" src="https://github.com/user-attachments/assets/4ca83a27-ae5d-4451-acc5-44a914de9d4a" />

Demo: https://youtu.be/BDXnaREFwCQ


## ✦ Features

- **Guided Daily Reflections:** Select your current mood to receive tailored, gentle journaling prompts.
- **AI-Powered Companionship:** Uses Azure OpenAI (`o4-mini` / `gpt-4o-mini`) or native OpenAI as a fallback to read your daily entries and offer warm, non-judgmental reflections.
- **Weekly Insights:** Automatically generates a beautiful, structured summary of your past 7 days, analyzing mood trends, recurring themes, and triggers.
- **Mindful Moments:** Generate short, randomized, AI-powered grounding exercises at the click of a button.
- **Voice Input:** Native speech-to-text integration for hands-free, stream-of-consciousness journaling.
- **Habit Suggestions:** Based on your recent entries, the AI can suggest one small, gentle habit to focus on.
- **Privacy First:** All your journaling data is stored completely locally in your browser's `localStorage`.
- **Hybrid AI Logic:** Intelligent fallback mechanism that prioritizes Azure OpenAI but automatically switches to native OpenAI if Azure is unavailable.

## 🚀 Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Vanilla CSS (Minimalist, dark-mode focused aesthetic)
- **State Management:** React Context API
- **AI Integration:** Azure OpenAI & OpenAI REST APIs

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

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (you can copy `.env.example`) and add your API keys:
   ```env
   # Azure OpenAI Settings
   VITE_AZURE_AI_PROJECT_ENDPOINT=your_endpoint_url
   VITE_AZURE_OPENAI_API_KEY=your_azure_key
   VITE_MODEL_DEPLOYMENT_NAME=gpt-4o-mini
   VITE_AZURE_OPENAI_API_VERSION=2024-12-01-preview

   # OpenAI Fallback Settings (Optional)
   VITE_OPENAI_API_KEY=your_openai_key
   VITE_OPENAI_MODEL_NAME=gpt-4o-mini
   ```
   *Note: If all API keys are left blank, the app will automatically enter offline simulation mode.*

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
