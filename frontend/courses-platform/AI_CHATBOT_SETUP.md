# AI Chatbot Setup Guide

## Overview

The OquSpace platform includes an AI-powered chatbot that can assist students with their learning journey. The chatbot uses Google's Gemini Pro model to provide contextual help and guidance.

## Features

- **Context-aware responses**: The AI understands which course and lesson you're currently viewing
- **Multilingual support**: Responds in Kazakh language by default
- **Learning assistance**: Helps with lesson content, assignments, tests, and study strategies
- **Technical support**: Can assist with platform usage questions
- **Persistent conversations**: Maintains conversation history during your session
- **Advanced safety**: Built-in content filtering and safety measures
- **Configuration-based**: API key is stored securely in the configuration file

## Setup Instructions

### 1. Get a Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Choose "Create API key in new project" or select an existing project
5. Copy the generated API key (it starts with `AIza`)

**Alternative method:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Generative Language API"
4. Go to "Credentials" and create an API key
5. Restrict the API key to "Generative Language API" for security

### 2. Configure the API Key in the Application

1. Navigate to the configuration file: `frontend/courses-platform/src/config/apiConfig.js`
2. Open the file in your code editor
3. Find the line that says:
   ```javascript
   apiKey: 'YOUR_GEMINI_API_KEY_HERE',
   ```
4. Replace `'YOUR_GEMINI_API_KEY_HERE'` with your actual Gemini API key:
   ```javascript
   apiKey: 'AIzaSyC-your-actual-api-key-here',
   ```
5. Save the file

**Example configuration:**

```javascript
const apiConfig = {
  gemini: {
    apiKey: "AIzaSyC-your-actual-api-key-here", // Your actual API key
    baseUrl:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    model: "gemini-pro",
    maxTokens: 500,
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
  },
  // ... rest of configuration
};
```

### 3. Restart the Application

After updating the configuration file:

1. Stop the development server if it's running (Ctrl+C)
2. Start the development server again:
   ```bash
   npm start
   ```

The AI chatbot will now be fully functional with your API key.

### 4. Using the AI Chatbot

Once configured, you can:

- Look for the chat bubble icon (💬) in the bottom-right corner of course and lesson pages
- Click on the chat bubble to open the AI assistant
- Start asking questions about your learning content
- The AI will provide contextual responses based on the current course/lesson

## Configuration Options

You can customize the AI behavior by modifying the configuration in `apiConfig.js`:

### Generation Settings

```javascript
gemini: {
  apiKey: 'your-api-key',
  maxTokens: 500,        // Maximum response length
  temperature: 0.7,      // Creativity level (0.0-1.0)
  topK: 40,             // Token selection diversity
  topP: 0.95,           // Nucleus sampling threshold
}
```

- **maxTokens**: Controls response length (100-2048)
- **temperature**: Higher values = more creative responses (0.0-1.0)
- **topK**: Number of top tokens to consider (1-40)
- **topP**: Probability threshold for token selection (0.0-1.0)

### Safety Settings

The configuration includes built-in safety filters that can be adjusted:

```javascript
safetySettings: [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE", // Options: BLOCK_NONE, BLOCK_ONLY_HIGH, BLOCK_MEDIUM_AND_ABOVE, BLOCK_LOW_AND_ABOVE
  },
  // ... other categories
];
```

## Example Questions

Here are some example questions you can ask the AI chatbot:

**About Lesson Content:**

- "Бұл сабақтың негізгі тақырыбы не?" (What is the main topic of this lesson?)
- "Мен бұл концепцияны қалай жақсы түсіне аламын?" (How can I better understand this concept?)

**Study Help:**

- "Бұл тақырып бойынша тест дайындалу үшін не істеу керек?" (What should I do to prepare for a test on this topic?)
- "Негізгі ұғымдарды қайталау үшін кеңес беріңіз" (Give me advice for reviewing key concepts)

**Technical Support:**

- "Тестті қалай тапсырамын?" (How do I submit a test?)
- "Прогресімді қалай көре аламын?" (How can I view my progress?)

## Security and Privacy

- **Configuration-based**: API key is stored in the application configuration, not in browser storage
- **Direct API calls**: Conversations are sent directly to Google's Gemini servers
- **Built-in safety**: Content filtering prevents harmful or inappropriate responses
- **No data persistence**: Conversations are not stored on our servers
- **Secure transmission**: All API calls use HTTPS encryption

## Troubleshooting

### "API кілті конфигурацияда орнатылмаған" (API key not configured)

- Check that you've updated the `apiConfig.js` file correctly
- Ensure the API key is not still set to `'YOUR_GEMINI_API_KEY_HERE'`
- Verify the API key starts with `AIza`
- Restart the development server after making changes

### "API кілті дұрыс емес немесе сұрау форматы қате" (Invalid API key or request format)

- Verify your API key is correct and active
- Make sure you've enabled the Generative Language API in Google Cloud Console
- Check that your API key hasn't been restricted or revoked

### "API кілтіне рұқсат жоқ немесе квота бітті" (No permission or quota exceeded)

- Check your Google Cloud Console for API quotas
- Verify billing is enabled for your Google Cloud project
- Make sure the Generative Language API is enabled

### "Сұрау лимиті асып кетті" (Rate limit exceeded)

- Wait a few minutes before trying again
- Check your API quota limits in Google Cloud Console
- Consider upgrading your quota if needed

### Chat not responding

- Check your internet connection
- Verify your API key is still valid
- Check the browser console for error messages
- Ensure the configuration file has been saved properly
- Try restarting the development server

## Development Notes

### File Structure

```
frontend/courses-platform/src/
├── config/
│   └── apiConfig.js          # Main configuration file
├── components/
│   └── AIChatButton.jsx      # Chat component
└── pages/
    ├── LessonPage.jsx        # Lesson page with chat
    └── CoursePage.jsx        # Course page with chat
```

### Environment Variables (Optional)

For production deployments, you may want to use environment variables instead of hardcoding the API key:

1. Create a `.env` file in the project root:

   ```
   REACT_APP_GEMINI_API_KEY=your-api-key-here
   ```

2. Update `apiConfig.js` to use the environment variable:

   ```javascript
   apiKey: process.env.REACT_APP_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE',
   ```

3. Add `.env` to your `.gitignore` file to keep the API key secure

## Cost Information

Using the AI chatbot will consume quota from your Google Cloud account. Google Gemini Pro offers:

- **Free tier**: Generous free quota for personal and educational use
- **Pay-per-use**: Very cost-effective pricing for additional usage
- **Quota monitoring**: Track usage in Google Cloud Console

The cost depends on:

- Number of input tokens (your messages)
- Number of output tokens (AI responses)
- Frequency of conversations

Gemini Pro is generally very cost-effective for educational use, often free for typical student usage patterns.

## API Key Security Best Practices

1. **Restrict your API key**: In Google Cloud Console, restrict the API key to only the Generative Language API
2. **Monitor usage**: Regularly check your API usage in Google Cloud Console
3. **Rotate keys**: Periodically generate new API keys and update them
4. **Environment variables**: Use environment variables for production deployments
5. **Don't commit keys**: Never commit API keys to version control

## Support

If you encounter issues with the AI chatbot:

1. First, try the troubleshooting steps above
2. Check the browser console for error messages
3. Verify your Google Cloud Console settings
4. Check that the configuration file is properly formatted
5. For Google Gemini API-specific issues, consult Google's documentation

---

**Note**: This feature requires an active internet connection and a valid Google Gemini API key. The quality of responses depends on the AI model's training and your specific questions.
