// API Configuration
// Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual Google Gemini API key

const apiConfig = {
  // Google Gemini API Configuration
  gemini: {
    apiKey: "AIzaSyD70jiF2Pbr7vWc4AzEB1KckeSLHWPr2-Y", // Replace with your actual API key
    baseUrl:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    model: "gemini-pro",
    maxTokens: 500,
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
  },

  // Safety settings for content filtering
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ],
};

// Validation function to check if API key is configured
export const isApiKeyConfigured = () => {
  return (
    apiConfig.gemini.apiKey &&
    apiConfig.gemini.apiKey !== "YOUR_GEMINI_API_KEY_HERE" &&
    apiConfig.gemini.apiKey.trim().length > 0
  );
};

// Get the configured API key
export const getGeminiApiKey = () => {
  return apiConfig.gemini.apiKey;
};

// Get the full Gemini configuration
export const getGeminiConfig = () => {
  return apiConfig.gemini;
};

// Get safety settings
export const getSafetySettings = () => {
  return apiConfig.safetySettings;
};

export default apiConfig;
