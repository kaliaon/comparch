import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  isApiKeyConfigured,
  getGeminiApiKey,
  getGeminiConfig,
  getSafetySettings,
} from "../config/apiConfig";

const AIChatButton = ({ courseId, lessonId, courseName, lessonTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Check if API key is configured
  const apiKeyConfigured = isApiKeyConfigured();

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const callGemini = async (userMessage, conversationHistory) => {
    if (!apiKeyConfigured) {
      throw new Error("API кілті конфигурацияда орнатылмаған");
    }

    const apiKey = getGeminiApiKey();
    const config = getGeminiConfig();
    const safetySettings = getSafetySettings();

    // Build context for the AI
    const systemContext = `Сіз CompArch онлайн оқу платформасының AI көмекшісісіз. Сіздің міндетіңіз - студенттерге олардың оқу процесінде көмектесу.

Ағымдағы контекст:
${courseName ? `- Курс: ${courseName}` : ""}
${lessonTitle ? `- Сабақ: ${lessonTitle}` : ""}
${courseId ? `- Курс ID: ${courseId}` : ""}
${lessonId ? `- Сабақ ID: ${lessonId}` : ""}

Сіз мына тақырыптарда көмектесе аласыз:
- Сабақ мазмұнын түсіндіру
- Тапсырмалар мен тесттерге көмек
- Оқу стратегиялары
- Техникалық мәселелер
- Платформаны пайдалану

Жауаптарыңыз қазақ тілінде, дос пен көмекші рухында болуы керек. Егер сұрақ оқумен байланысты болмаса, оқуға бағыттауға тырысыңыз.`;

    // Build conversation history for Gemini
    let conversationText = systemContext + "\n\n";

    // Add conversation history
    conversationHistory.forEach((msg) => {
      if (msg.sender === "user") {
        conversationText += `Пайдаланушы: ${msg.text}\n`;
      } else {
        conversationText += `AI көмекші: ${msg.text}\n`;
      }
    });

    // Add current user message
    conversationText += `Пайдаланушы: ${userMessage}\nAI көмекші: `;

    const response = await fetch(`${config.baseUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: conversationText,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: config.temperature,
          topK: config.topK,
          topP: config.topP,
          maxOutputTokens: config.maxTokens,
        },
        safetySettings: safetySettings,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 400) {
        throw new Error(
          "API кілті дұрыс емес немесе сұрау форматы қате. Конфигурацияны тексеріңіз."
        );
      } else if (response.status === 403) {
        throw new Error("API кілтіне рұқсат жоқ немесе квота бітті.");
      } else if (response.status === 429) {
        throw new Error(
          "Сұрау лимиті асып кетті. Біраз уақыттан кейін қайталаңыз."
        );
      } else {
        throw new Error(
          `API қатесі: ${errorData.error?.message || "Белгісіз қате"}`
        );
      }
    }

    const data = await response.json();

    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content
    ) {
      return (
        data.candidates[0].content.parts[0].text ||
        "Кешіріңіз, жауап ала алмадым."
      );
    } else {
      throw new Error("Gemini API-дан дұрыс жауап алынбады.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === "" || isLoading) return;

    if (!apiKeyConfigured) {
      setMessages((prev) => [
        ...prev,
        {
          text: "API кілті конфигурацияда орнатылмаған. Әкімшіге хабарласыңыз.",
          sender: "ai",
          isError: true,
        },
      ]);
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message immediately
    const newMessages = [...messages, { text: userMessage, sender: "user" }];
    setMessages(newMessages);

    try {
      const aiResponse = await callGemini(userMessage, messages);
      setMessages((prev) => [...prev, { text: aiResponse, sender: "ai" }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: `Қате: ${error.message}`,
          sender: "ai",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {isOpen && (
        <ChatContainer>
          <ChatHeader>
            <div>AI Көмекші (Gemini)</div>
            <HeaderActions>
              {!apiKeyConfigured && (
                <ConfigWarning title="API кілті конфигурацияда орнатылмаған">
                  ⚠️
                </ConfigWarning>
              )}
              <CloseButton onClick={toggleChat}>×</CloseButton>
            </HeaderActions>
          </ChatHeader>

          <MessagesContainer>
            {!apiKeyConfigured && (
              <ConfigurationMessage>
                <ConfigIcon>⚙️</ConfigIcon>
                <ConfigText>
                  AI көмекшісін пайдалану үшін конфигурация файлында Gemini API
                  кілтін орнатыңыз.
                  <br />
                  <ConfigPath>src/config/apiConfig.js</ConfigPath> файлын
                  өңдеңіз.
                </ConfigText>
              </ConfigurationMessage>
            )}

            {messages.length === 0 && apiKeyConfigured ? (
              <WelcomeMessage>
                Сәлеметсіз бе! Мен сіздің AI көмекшіңізбін (Google Gemini
                арқылы).
                {courseName && ` "${courseName}" курсы бойынша`}
                {lessonTitle && ` "${lessonTitle}" сабағы туралы`}{" "}
                сұрақтарыңызға жауап бере аламын. Бүгін сізге қалай көмектесе
                аламын?
              </WelcomeMessage>
            ) : (
              messages.map((message, index) => (
                <Message
                  key={index}
                  sender={message.sender}
                  isError={message.isError}
                >
                  {message.text}
                </Message>
              ))
            )}
            {isLoading && (
              <Message sender="ai">
                <LoadingDots>
                  <span></span>
                  <span></span>
                  <span></span>
                </LoadingDots>
              </Message>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          <InputForm onSubmit={handleSubmit}>
            <ChatInput
              type="text"
              placeholder={
                apiKeyConfigured
                  ? "Хабарлама жазыңыз..."
                  : "API кілті конфигурацияда орнатылмаған..."
              }
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={!apiKeyConfigured || isLoading}
            />
            <SendButton
              type="submit"
              disabled={!apiKeyConfigured || isLoading || !input.trim()}
            >
              <SendIcon>↑</SendIcon>
            </SendButton>
          </InputForm>
        </ChatContainer>
      )}
      <ChatButtonContainer>
        <ChatButtonCircle onClick={toggleChat}>
          <ChatIcon>💬</ChatIcon>
          {!apiKeyConfigured && <ApiKeyIndicator>!</ApiKeyIndicator>}
        </ChatButtonCircle>
      </ChatButtonContainer>
    </>
  );
};

export default AIChatButton;

// Styled Components
const ChatButtonContainer = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
`;

const ChatButtonCircle = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #3066be;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(48, 102, 190, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: #254d95;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(48, 102, 190, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 8px rgba(48, 102, 190, 0.3);
  }
`;

const ChatIcon = styled.span`
  font-size: 26px;
`;

const ChatContainer = styled.div`
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 350px;
  height: 500px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ChatHeader = styled.div`
  padding: 16px;
  background-color: #3066be;
  color: white;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ConfigWarning = styled.span`
  font-size: 16px;
  cursor: help;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 26px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #f8f9fa;
`;

const ConfigurationMessage = styled.div`
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  margin: 15px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ConfigIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const ConfigText = styled.div`
  color: #856404;
  font-size: 14px;
  line-height: 1.4;
`;

const ConfigPath = styled.code`
  background-color: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  font-size: 12px;
  color: #495057;
`;

const WelcomeMessage = styled.div`
  background-color: #e7f0ff;
  padding: 14px;
  border-radius: 12px;
  align-self: center;
  max-width: 85%;
  color: #333;
  text-align: center;
  margin: 15px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  line-height: 1.4;
`;

const Message = styled.div`
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 85%;
  word-break: break-word;
  line-height: 1.4;

  ${(props) =>
    props.sender === "user"
      ? `
    background-color: #3066be;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
    color: white;
    box-shadow: 0 1px 2px rgba(48, 102, 190, 0.2);
  `
      : `
    background-color: ${props.isError ? "#fee" : "white"};
    align-self: flex-start;
    border-bottom-left-radius: 4px;
    color: ${props.isError ? "#d63384" : "#333"};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-left: ${props.isError ? "3px solid #d63384" : "none"};
  `}
`;

const InputForm = styled.form`
  display: flex;
  padding: 12px 15px;
  border-top: 1px solid #e0e0e0;
  background-color: #fff;
  align-items: center;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  outline: none;
  font-size: 14px;
  background-color: #f5f5f5;
  transition: all 0.2s;

  &:focus {
    border-color: #3066be;
    background-color: white;
    box-shadow: 0 0 0 2px rgba(48, 102, 190, 0.1);
  }

  &:disabled {
    background-color: #e9ecef;
    color: #6c757d;
  }
`;

const SendButton = styled.button`
  background-color: ${(props) => (props.disabled ? "#ccc" : "#3066be")};
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-left: 10px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.disabled ? "#ccc" : "#254d95")};
    transform: ${(props) => (props.disabled ? "none" : "scale(1.05)")};
  }

  &:active {
    transform: ${(props) => (props.disabled ? "none" : "scale(0.95)")};
  }
`;

const SendIcon = styled.span`
  font-size: 18px;
  font-weight: bold;
`;

const ApiKeyIndicator = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #3066be;
    animation: bounce 1.4s ease-in-out infinite both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;
