// config.js
export const AZURE_CONFIG = {
    endpoint: import.meta.env.VITE_AZURE_AI_PROJECT_ENDPOINT,
    apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY,
    deploymentName: import.meta.env.VITE_MODEL_DEPLOYMENT_NAME,
    apiVersion: import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
    openai: {
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        model: import.meta.env.VITE_OPENAI_MODEL_NAME || 'gpt-4o-mini',
    }
};