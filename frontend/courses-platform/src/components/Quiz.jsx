import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

import { useNavigate } from "react-router-dom";

const Quiz = ({ quizData, nextLessonId, courseId }) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const timerRef = useRef(null);

  // Process quiz data to ensure it's in a consistent format
  const processedQuizData = React.useMemo(() => {
    if (!quizData) return null;

    // Handle the new API test format
    if (quizData.questions && Array.isArray(quizData.questions)) {
      // If it has 'questions' array with question_type property, it's the new format
      if (
        quizData.questions.length > 0 &&
        "question_type" in quizData.questions[0]
      ) {
        return {
          title: quizData.title || "Тест",
          description: quizData.description || "Сабақ бойынша тест",
          time_limit_minutes: quizData.time_limit || 30,
          passing_score: quizData.passing_score || 70,
          questions: quizData.questions.map((q) => ({
            id: q.id,
            text: q.text,
            points: q.points,
            type: q.question_type === "MCQ" ? "multiple_choice" : "open_ended",
            choices: q.choices.map((c) => ({
              id: c.id,
              text: c.text,
              is_correct: c.is_correct,
            })),
            explanation: q.explanation || "",
          })),
        };
      }
    }

    // Return the original data if it's already in the expected format
    return quizData;
  }, [quizData]);

  // Initialize quiz when processedQuizData changes
  useEffect(() => {
    if (!processedQuizData) return;

    // Initialize time remaining
    const timeLimit = processedQuizData.time_limit_minutes * 60; // Convert to seconds
    setTimeRemaining(timeLimit);

    // Initialize answers object
    const initialAnswers = {};
    processedQuizData.questions.forEach((question) => {
      if (question.type === "multiple_choice") {
        initialAnswers[question.id] = {
          questionId: question.id,
          selectedChoiceIds: [],
        };
      } else if (question.type === "open_ended") {
        initialAnswers[question.id] = {
          questionId: question.id,
          textAnswer: "",
        };
      }
    });
    setUserAnswers(initialAnswers);

    return () => {
      // Cleanup timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [processedQuizData]);

  // Start the timer
  useEffect(() => {
    if (timeRemaining <= 0 || quizSubmitted) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining, quizSubmitted]);

  // Validate if quiz data is available
  if (
    !processedQuizData ||
    !processedQuizData.questions ||
    processedQuizData.questions.length === 0
  ) {
    return (
      <QuizContainer>
        <ErrorMessage>
          Тест деректері қолжетімді емес немесе жарамсыз.
        </ErrorMessage>
      </QuizContainer>
    );
  }

  const currentQuestion = processedQuizData.questions[currentQuestionIndex];

  // Handle answer change for multiple choice questions
  const handleMultipleChoiceAnswer = (choiceId) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        selectedChoiceIds: [choiceId], // Single selection for now
      },
    }));
  };

  // Handle answer change for open-ended questions
  const handleOpenEndedAnswer = (text) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        textAnswer: text,
      },
    }));
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < processedQuizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Submit quiz answers
  const handleSubmitQuiz = async () => {
    if (quizSubmitted) return;

    setLoading(true);
    setQuizSubmitted(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Normally here we would submit to the backend API
    // For now, we'll simulate a result calculation

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Calculate score (in real app, this would come from the API)
      let correctAnswers = 0;
      let totalPoints = 0;

      processedQuizData.questions.forEach((question) => {
        const userAnswer = userAnswers[question.id];
        if (question.type === "multiple_choice" && userAnswer) {
          const selectedChoiceId = userAnswer.selectedChoiceIds[0];
          const correctChoice = question.choices.find(
            (choice) => choice.is_correct
          );

          if (correctChoice && selectedChoiceId === correctChoice.id) {
            correctAnswers++;
            totalPoints += question.points;
          }
        }
        // For open-ended questions, we would need backend validation
      });

      const percentageScore =
        (totalPoints /
          processedQuizData.questions.reduce((sum, q) => sum + q.points, 0)) *
        100;
      const passed = percentageScore >= processedQuizData.passing_score;

      setQuizResult({
        score: percentageScore.toFixed(1),
        correctAnswers,
        totalQuestions: processedQuizData.questions.length,
        passed,
      });
    } catch (err) {
      setError(
        "Тест жауаптарын жіберу кезінде қате орын алды. Қайталап көріңіз."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizSubmitted(false);
    setQuizResult(null);
    setCurrentQuestionIndex(0);
    setReviewMode(false);

    // Re-initialize answers
    const initialAnswers = {};
    processedQuizData.questions.forEach((question) => {
      if (question.type === "multiple_choice") {
        initialAnswers[question.id] = {
          questionId: question.id,
          selectedChoiceIds: [],
        };
      } else if (question.type === "open_ended") {
        initialAnswers[question.id] = {
          questionId: question.id,
          textAnswer: "",
        };
      }
    });
    setUserAnswers(initialAnswers);

    // Reset timer
    const timeLimit = processedQuizData.time_limit_minutes * 60;
    setTimeRemaining(timeLimit);
  };

  // Show results after submission
  if (quizSubmitted && quizResult) {
    return (
      <QuizContainer>
        <ResultsContainer>
          <ResultsHeader>Тест аяқталды</ResultsHeader>

          {quizResult.passed ? (
            <ResultsSuccess>Құттықтаймыз! Сіз тесттен өттіңіз.</ResultsSuccess>
          ) : (
            <ResultsFailure>
              Өкінішке орай, сіз тесттен өте алмадыңыз.
            </ResultsFailure>
          )}

          <ResultsDetails>
            <ResultItem>
              Нәтиже: <ResultValue>{quizResult.score}%</ResultValue>
            </ResultItem>
            <ResultItem>
              Дұрыс жауаптар:{" "}
              <ResultValue>
                {quizResult.correctAnswers} / {quizResult.totalQuestions}
              </ResultValue>
            </ResultItem>
          </ResultsDetails>

          <ResultsButtons>
            <ActionButton onClick={() => setReviewMode(true)}>
              Қателермен жұмыс (Разбор)
            </ActionButton>
            <ActionButton secondary onClick={handleRetakeQuiz}>
              Қайта тапсыру
            </ActionButton>
          </ResultsButtons>

          {reviewMode && (
            <ReviewSection>
              <ReviewTitle>Қателерді талдау</ReviewTitle>
              {processedQuizData.questions.map((question, index) => {
                const userAnswer = userAnswers[question.id];
                const selectedChoiceId = userAnswer?.selectedChoiceIds[0];
                const correctChoice = question.choices.find(c => c.is_correct);
                const isCorrect = selectedChoiceId === correctChoice?.id;

                return (
                  <ReviewItem key={question.id} correct={isCorrect}>
                    <ReviewQuestion>
                      {index + 1}. {question.text}
                    </ReviewQuestion>
                    <ReviewAnswerRow>
                      <ReviewLabel>Сіздің жауабыңыз:</ReviewLabel>
                      <ReviewValueText correct={isCorrect}>
                        {question.choices.find(c => c.id === selectedChoiceId)?.text || "Жауап берілмеді"}
                      </ReviewValueText>
                    </ReviewAnswerRow>
                    {!isCorrect && (
                      <ReviewAnswerRow>
                        <ReviewLabel>Дұрыс жауап:</ReviewLabel>
                        <ReviewValueText correct={true}>
                          {correctChoice?.text}
                        </ReviewValueText>
                      </ReviewAnswerRow>
                    )}
                    {question.explanation && (
                      <ExplanationBox>
                        <strong>Түсіндірме:</strong> {question.explanation}
                      </ExplanationBox>
                    )}
                  </ReviewItem>
                );
              })}
            </ReviewSection>
          )}

          <NextLessonContainer>
            <ReturnButton onClick={() => window.location.reload()}>
              Сабаққа оралу
            </ReturnButton>
          </NextLessonContainer>
        </ResultsContainer>
      </QuizContainer>
    );
  }

  // Show loading state during submission
  if (loading) {
    return (
      <QuizContainer>
        <LoadingContainer>
          <LoadingText>Жауаптар тексерілуде...</LoadingText>
        </LoadingContainer>
      </QuizContainer>
    );
  }

  return (
    <QuizContainer>
      <QuizHeader>
        <QuizTitle>{processedQuizData.title}</QuizTitle>
        <QuizDescription>{processedQuizData.description}</QuizDescription>
        <QuizInfoBar>
          <QuizProgress>
            Сұрақ {currentQuestionIndex + 1} /{" "}
            {processedQuizData.questions.length}
          </QuizProgress>
          <QuizTimer className={timeRemaining < 60 ? "warning" : ""}>
            Уақыт: {formatTime(timeRemaining)}
          </QuizTimer>
        </QuizInfoBar>
      </QuizHeader>

      <QuestionContainer>
        <QuestionNumber>Сұрақ {currentQuestionIndex + 1}</QuestionNumber>
        <QuestionText>{currentQuestion.text}</QuestionText>
        <QuestionPoints>Ұпай: {currentQuestion.points}</QuestionPoints>

        {currentQuestion.type === "multiple_choice" ? (
          <ChoicesContainer>
            {currentQuestion.choices.map((choice) => (
              <ChoiceItem
                key={choice.id}
                isSelected={userAnswers[
                  currentQuestion.id
                ]?.selectedChoiceIds.includes(choice.id)}
              >
                <ChoiceInput
                  type="radio"
                  id={`choice-${choice.id}`}
                  name={`question-${currentQuestion.id}`}
                  checked={userAnswers[
                    currentQuestion.id
                  ]?.selectedChoiceIds.includes(choice.id)}
                  onChange={() => handleMultipleChoiceAnswer(choice.id)}
                />
                <ChoiceLabel htmlFor={`choice-${choice.id}`}>
                  {choice.text}
                </ChoiceLabel>
              </ChoiceItem>
            ))}
          </ChoicesContainer>
        ) : (
          <OpenEndedContainer>
            <OpenEndedInput
              placeholder="Жауабыңызды осында жазыңыз..."
              value={userAnswers[currentQuestion.id]?.textAnswer || ""}
              onChange={(e) => handleOpenEndedAnswer(e.target.value)}
            />
          </OpenEndedContainer>
        )}
      </QuestionContainer>

      <NavigationContainer>
        <NavButton
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Алдыңғы
        </NavButton>

        {currentQuestionIndex < processedQuizData.questions.length - 1 ? (
          <NavButton onClick={handleNextQuestion}>Келесі</NavButton>
        ) : (
          <SubmitButton onClick={handleSubmitQuiz}>Тестті аяқтау</SubmitButton>
        )}
      </NavigationContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </QuizContainer>
  );
};

export default Quiz;

// Styled Components
const QuizContainer = styled.div`
  width: 100%;
  margin: 20px 0;
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 800px;
`;

const QuizHeader = styled.div`
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
`;

const QuizTitle = styled.h2`
  font-size: 1.8rem;
  color: #3066be;
  margin-bottom: 10px;
`;

const QuizDescription = styled.p`
  color: #666;
  font-size: 1rem;
  margin-bottom: 15px;
`;

const QuizInfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
`;

const QuizProgress = styled.div`
  font-weight: 500;
  color: #555;
`;

const QuizTimer = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: #3066be;

  &.warning {
    color: #e74c3c;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
    100% {
      opacity: 1;
    }
  }
`;

const QuestionContainer = styled.div`
  margin-bottom: 25px;
  background-color: #f9fafc;
  padding: 20px;
  border-radius: 10px;
`;

const QuestionNumber = styled.div`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 10px;
`;

const QuestionText = styled.h3`
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.4;
`;

const QuestionPoints = styled.div`
  font-size: 0.9rem;
  color: #3066be;
  margin-bottom: 20px;
  font-weight: 500;
`;

const ChoicesContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
`;

const ChoiceItem = styled.div`
  padding: 12px 15px;
  border: 1px solid ${(props) => (props.isSelected ? "#3066be" : "#ddd")};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  background-color: ${(props) => (props.isSelected ? "#f0f5ff" : "white")};
  width: auto;

  &:hover {
    background-color: ${(props) => (props.isSelected ? "#f0f5ff" : "#f9f9f9")};
    border-color: ${(props) => (props.isSelected ? "#3066be" : "#bbb")};
  }
`;

const ChoiceInput = styled.input`
  margin-right: 10px;
`;

const ChoiceLabel = styled.label`
  flex: 1;
  cursor: pointer;
`;

const OpenEndedContainer = styled.div`
  margin-top: 15px;
  width: 100%;
`;

const OpenEndedInput = styled.textarea`
  width: auto;
  height: 80px;
  max-height: 120px;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  line-height: 1.5;
  background-color: #fff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3066be;
    box-shadow: 0 0 0 2px rgba(48, 102, 190, 0.1);
  }

  &::placeholder {
    color: #aaa;
  }
`;

const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
`;

const NavButton = styled.button`
  background-color: white;
  color: #3066be;
  border: 1px solid #3066be;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: #f0f5ff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  background-color: #3066be;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #254d95;
    transform: translateY(-2px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ResultsContainer = styled.div`
  text-align: center;
  padding: 20px;
`;

const ResultsHeader = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
`;

const ResultsSuccess = styled.div`
  font-size: 1.5rem;
  color: #27ae60;
  margin-bottom: 20px;
  font-weight: 500;
`;

const ResultsFailure = styled.div`
  font-size: 1.5rem;
  color: #e74c3c;
  margin-bottom: 20px;
  font-weight: 500;
`;

const ResultsDetails = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin: 20px auto;
  max-width: 400px;
`;

const ResultItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 1.1rem;
  padding: 5px 0;
`;

const ResultValue = styled.span`
  font-weight: 700;
  color: #3066be;
`;

const ReturnButton = styled.button`
  background-color: #3066be;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 5px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.2s;

  &:hover {
    background-color: #254d95;
  }
`;



const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

const LoadingText = styled.div`
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  background-color: #fde8e7;
  padding: 15px;
  border-radius: 5px;
  text-align: center;
  margin: 20px 0;
  font-weight: 500;
`;

const NextLessonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 20px;
`;

const ResultsButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.secondary ? 'white' : '#3066be'};
  color: ${props => props.secondary ? '#3066be' : 'white'};
  border: 1px solid #3066be;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.secondary ? '#f0f5ff' : '#254d95'};
  }
`;

const ReviewSection = styled.div`
  margin-top: 40px;
  text-align: left;
  border-top: 2px solid #eee;
  padding-top: 30px;
`;

const ReviewTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
`;

const ReviewItem = styled.div`
  margin-bottom: 25px;
  padding: 20px;
  border-radius: 10px;
  background-color: ${props => props.correct ? '#f0fff4' : '#fff5f5'};
  border-left: 5px solid ${props => props.correct ? '#27ae60' : '#e74c3c'};
`;

const ReviewQuestion = styled.h4`
  font-size: 1.1rem;
  margin-bottom: 15px;
  color: #333;
`;

const ReviewAnswerRow = styled.div`
  display: flex;
  margin-bottom: 8px;
  font-size: 0.95rem;
`;

const ReviewLabel = styled.span`
  font-weight: 600;
  min-width: 140px;
  color: #666;
`;

const ReviewValueText = styled.span`
  color: ${props => props.correct ? '#27ae60' : '#e74c3c'};
  font-weight: 500;
`;

const ExplanationBox = styled.div`
  margin-top: 15px;
  padding: 12px;
  background-color: rgba(48, 102, 190, 0.05);
  border-radius: 6px;
  font-size: 0.95rem;
  color: #444;
  line-height: 1.5;
`;
