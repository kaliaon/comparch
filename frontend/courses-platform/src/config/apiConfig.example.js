// Example API Configuration File
// Copy this file to apiConfig.js and replace the placeholder with your actual API key

const apiConfig = {
  // Google Gemini API Configuration
  gemini: {
    apiKey: "AIzaSyC-your-actual-gemini-api-key-here", // Replace with your actual API key from Google AI Studio
    baseUrl:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    model: "gemini-pro",
    maxTokens: 500, // Maximum response length (100-2048)
    temperature: 0.7, // Creativity level (0.0-1.0, higher = more creative)
    topK: 40, // Token selection diversity (1-40)
    topP: 0.95, // Nucleus sampling threshold (0.0-1.0)
  },

  // Safety settings for content filtering
  // You can adjust these thresholds based on your needs
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE", // Options: BLOCK_NONE, BLOCK_ONLY_HIGH, BLOCK_MEDIUM_AND_ABOVE, BLOCK_LOW_AND_ABOVE
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
    apiConfig.gemini.apiKey !== "AIzaSyC-your-actual-gemini-api-key-here" &&
    apiConfig.gemini.apiKey.trim().length > 0 &&
    apiConfig.gemini.apiKey.startsWith("AIza")
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

/*
SETUP INSTRUCTIONS:

1. Get your Google Gemini API key:
   - Visit https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated key (starts with "AIza")

2. Replace the placeholder:
   - Change 'AIzaSyC-your-actual-gemini-api-key-here' to your actual API key
   - Make sure to keep the quotes around the key

3. Save the file as apiConfig.js (remove .example from the filename)

4. Restart your development server:
   - Stop the server (Ctrl+C)
   - Run: npm start

Example of a properly configured API key:
apiKey: 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',

SECURITY NOTES:
- Never commit your actual API key to version control
- Consider using environment variables for production
- Restrict your API key in Google Cloud Console
- Monitor your API usage regularly
*/
