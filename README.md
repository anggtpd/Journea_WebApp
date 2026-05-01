# Journea – Setup Guide

## How to Add Your Azure OpenAI API Key

Open `config.js` and fill in these 3 values:

```js
const AZURE_CONFIG = {
  endpoint: "https://YOUR-RESOURCE-NAME.openai.azure.com",
  apiKey: "YOUR_32_CHAR_API_KEY_HERE",
  deploymentName: "gpt-4o",   // or gpt-35-turbo
  apiVersion: "2024-02-01",
};
```

### Step-by-step:

1. Go to https://portal.azure.com → search "Azure OpenAI"
2. Open your resource → click **Keys and Endpoint** in the left menu
3. Copy **Endpoint** → paste into `endpoint:`
4. Copy **KEY 1** → paste into `apiKey:`
5. Go to **Model deployments** → note your deployment name → paste into `deploymentName:`
6. Save `config.js`
7. Open `index.html` in your browser — the app will now use Azure OpenAI

> Without a key, the app still works using built-in fallback responses.
