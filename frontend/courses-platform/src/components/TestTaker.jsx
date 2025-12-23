import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { testService } from "../services";

const TestTaker = ({ testId, onComplete }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [test, setTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submit the test
  const handleSubmitTest = useCallback(async () => {
    try {
      setIsSubmitting(true);

      // Format answers for API
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, value]) => {
          const question = test?.questions.find(
            (q) => q.id.toString() === questionId.toString()
          );
          return {
            question_id: questionId,
            selected_choices: question?.question_type === "MCQ" ? value : [],
            text_answer: question?.question_type === "OPEN" ? value : "",
          };
        }
      );

      const response = await testService.submitTestAnswers(
        submission?.id,
        formattedAnswers
      );
      if (!response.success) {
        throw new Error(
          response.message || "Тест жауаптарын жіберу мүмкін болмады"
        );
      }

      // Call onComplete callback with the submission ID for result viewing
      if (onComplete) {
        onComplete(submission.id);
      } else {
        // If no callback, navigate to results page
        navigate(`/test-results/${submission.id}`);
      }
    } catch (err) {
      setError(err.message || "Тестті жіберу кезінде қате пайда болды");
      setIsSubmitting(false);
    }
  }, [answers, submission, test, onComplete, navigate]);

  // Start the test when component mounts
  useEffect(() => {
    const initializeTest = async () => {
      try {
        setLoading(true);

        // First get test details
        const testResponse = await testService.getTestDetails(testId);
        if (!testResponse.success) {
          throw new Error(
            testResponse.message || "Тест ақпаратын жүктеу мүмкін болмады"
          );
        }
        setTest(testResponse.data);

        // Then start the test (create a submission)
        const submissionResponse = await testService.startTest(testId);
        if (!submissionResponse.success) {
          throw new Error(
            submissionResponse.message || "Тестті бастау мүмкін болмады"
          );
        }

        setSubmission(submissionResponse.data);

        // Initialize timeRemaining if test has time limit
        if (testResponse.data.time_limit_minutes) {
          setTimeRemaining(testResponse.data.time_limit_minutes * 60);
        }

        // Initialize empty answers object
        const initialAnswers = {};
        testResponse.data.questions.forEach((question) => {
          initialAnswers[question.id] =
            question.question_type === "MCQ" ? [] : "";
        });
        setAnswers(initialAnswers);

        setLoading(false);
      } catch (err) {
        setError(err.message || "Тест жүктеу кезінде қате пайда болды");
        setLoading(false);
      }
    };

    initializeTest();
  }, [testId]);

  // Timer effect for time-limited tests
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0 || loading || !submission) return;

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, loading, submission, handleSubmitTest]);

  // Handle answer changes
  const handleAnswerChange = (questionId, value, questionType) => {
    setAnswers((prevAnswers) => {
      if (questionType === "MCQ") {
        // For MCQ, toggle the choice in the array
        const currentSelections = [...(prevAnswers[questionId] || [])];
        const index = currentSelections.indexOf(value);

        if (index === -1) {
          currentSelections.push(value);
        } else {
          currentSelections.splice(index, 1);
        }

        return { ...prevAnswers, [questionId]: currentSelections };
      } else {
        // For open-ended questions, just set the text
        return { ...prevAnswers, [questionId]: value };
      }
    });
  };

  // Navigation between questions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Render loading state
  if (loading) {
    return <LoadingContainer>Тест жүктелуде...</LoadingContainer>;
  }

  // Render error state
  if (error) {
    return <ErrorContainer>Қате: {error}</ErrorContainer>;
  }

  // Calculate progress
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;

  // Get current question
  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <TestContainer>
      <TestHeader>
        <TestTitle>{test.title}</TestTitle>
        {timeRemaining && (
          <Timer>
            Уақыт: {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </Timer>
        )}
      </TestHeader>

      <ProgressBar>
        <ProgressFill style={{ width: `${progress}%` }} />
      </ProgressBar>

      <QuestionContainer>
        <QuestionNumber>
          Сұрақ {currentQuestionIndex + 1} / {test.questions.length}
        </QuestionNumber>
        <QuestionText>{currentQuestion.text}</QuestionText>
        <QuestionPoints>{currentQuestion.points} ұпай</QuestionPoints>

        {currentQuestion.question_type === "MCQ" ? (
          <ChoicesList>
            {currentQuestion.choices.map((choice) => (
              <ChoiceItem key={choice.id}>
                <Checkbox
                  type="checkbox"
                  checked={answers[currentQuestion.id]?.includes(choice.id)}
                  onChange={() =>
                    handleAnswerChange(currentQuestion.id, choice.id, "MCQ")
                  }
                  id={`choice-${choice.id}`}
                />
                <ChoiceLabel htmlFor={`choice-${choice.id}`}>
                  {choice.text}
                </ChoiceLabel>
              </ChoiceItem>
            ))}
          </ChoicesList>
        ) : (
          <OpenAnswerContainer>
            <OpenAnswerTextarea
              value={answers[currentQuestion.id] || ""}
              onChange={(e) =>
                handleAnswerChange(currentQuestion.id, e.target.value, "OPEN")
              }
              placeholder="Жауапты енгізіңіз..."
              rows={5}
            />
          </OpenAnswerContainer>
        )}
      </QuestionContainer>

      <NavigationButtons>
        <NavButton
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Алдыңғы
        </NavButton>

        {currentQuestionIndex < test.questions.length - 1 ? (
          <NavButton onClick={goToNextQuestion}>Келесі</NavButton>
        ) : (
          <SubmitButton onClick={handleSubmitTest} disabled={isSubmitting}>
            {isSubmitting ? "Жіберілуде..." : "Тестті аяқтау"}
          </SubmitButton>
        )}
      </NavigationButtons>

      <QuestionDots>
        {test.questions.map((_, index) => (
          <QuestionDot
            key={index}
            active={index === currentQuestionIndex}
            answered={!!answers[test.questions[index].id]?.length}
            onClick={() => setCurrentQuestionIndex(index)}
          />
        ))}
      </QuestionDots>
    </TestContainer>
  );
};

export default TestTaker;

// Styled Components
const TestContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const TestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TestTitle = styled.h1`
  font-size: 24px;
  color: #333;
  margin: 0;
`;

const Timer = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #d9534f;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #5cb85c;
  transition: width 0.3s ease;
`;

const QuestionContainer = styled.div`
  margin-bottom: 30px;
`;

const QuestionNumber = styled.div`
  font-size: 16px;
  color: #777;
  margin-bottom: 10px;
`;

const QuestionText = styled.h2`
  font-size: 20px;
  color: #333;
  margin: 0 0 10px 0;
`;

const QuestionPoints = styled.div`
  font-size: 14px;
  color: #777;
  margin-bottom: 20px;
`;

const ChoicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ChoiceItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const ChoiceLabel = styled.label`
  cursor: pointer;
`;

const OpenAnswerContainer = styled.div`
  margin-top: 10px;
`;

const OpenAnswerTextarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: inherit;
  font-size: 16px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #5cb85c;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const NavButton = styled.button`
  padding: 10px 20px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #e0e0e0;
  }
`;

const SubmitButton = styled(NavButton)`
  background-color: #5cb85c;
  color: white;

  &:hover:not(:disabled) {
    background-color: #4cae4c;
  }
`;

const QuestionDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
`;

const QuestionDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.active ? "#5cb85c" : props.answered ? "#f0ad4e" : "#ddd"};
  cursor: pointer;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #777;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 20px;
  color: #d9534f;
  background-color: #f9f2f2;
  border-radius: 5px;
  margin: 20px 0;
`;
