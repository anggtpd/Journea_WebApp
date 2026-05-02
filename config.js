// config.js
export const AZURE_CONFIG = {
    endpoint: import.meta.env.VITE_AZURE_AI_PROJECT_ENDPOINT,
    apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY,
    deploymentName: import.meta.env.VITE_MODEL_DEPLOYMENT_NAME,
    apiVersion: import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
};