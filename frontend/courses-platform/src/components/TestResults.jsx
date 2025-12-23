import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { testService } from "../services";

const TestResults = ({ submissionId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await testService.getTestResults(submissionId);

        if (!response.success) {
          throw new Error(
            response.message || "Тест нәтижелерін жүктеу мүмкін болмады"
          );
        }

        setResults(response.data);
        setLoading(false);
      } catch (err) {
        setError(
          err.message || "Тест нәтижелерін жүктеу кезінде қате пайда болды"
        );
        setLoading(false);
      }
    };

    fetchResults();
  }, [submissionId]);

  // Loading state
  if (loading) {
    return <LoadingContainer>Нәтижелер жүктелуде...</LoadingContainer>;
  }

  // Error state
  if (error) {
    return <ErrorContainer>Қате: {error}</ErrorContainer>;
  }

  // Calculate stats
  const totalQuestions = results.answers.length;
  const correctAnswers = results.answers.filter(
    (answer) => answer.is_correct
  ).length;
  const incorrectAnswers = results.answers.filter(
    (answer) => answer.is_correct === false
  ).length;
  const pendingAnswers = results.answers.filter(
    (answer) => answer.is_correct === null
  ).length;

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <ResultsContainer>
      <ResultsHeader>
        <TestTitle>{results.test.title}</TestTitle>
        <ResultsStatus passed={results.score >= results.test.passing_score}>
          {results.score >= results.test.passing_score
            ? "Сәтті өтті"
            : "Сәтсіз"}
        </ResultsStatus>
      </ResultsHeader>

      <ScoreSection>
        <ScoreCircle
          score={results.score}
          passingScore={results.test.passing_score}
        >
          <ScoreValue>{Math.round(results.score)}%</ScoreValue>
          <PassingScore>Өту шегі: {results.test.passing_score}%</PassingScore>
        </ScoreCircle>

        <ScoreDetails>
          <ScoreDetailItem>
            <ScoreDetailLabel>Басталу уақыты:</ScoreDetailLabel>
            <ScoreDetailValue>
              {formatDate(results.start_time)}
            </ScoreDetailValue>
          </ScoreDetailItem>
          <ScoreDetailItem>
            <ScoreDetailLabel>Аяқталу уақыты:</ScoreDetailLabel>
            <ScoreDetailValue>{formatDate(results.end_time)}</ScoreDetailValue>
          </ScoreDetailItem>
          <ScoreDetailItem>
            <ScoreDetailLabel>Жалпы сұрақтар:</ScoreDetailLabel>
            <ScoreDetailValue>{totalQuestions}</ScoreDetailValue>
          </ScoreDetailItem>
          <ScoreDetailItem>
            <ScoreDetailLabel>Дұрыс жауаптар:</ScoreDetailLabel>
            <ScoreDetailValue correct>{correctAnswers}</ScoreDetailValue>
          </ScoreDetailItem>
          <ScoreDetailItem>
            <ScoreDetailLabel>Қате жауаптар:</ScoreDetailLabel>
            <ScoreDetailValue incorrect>{incorrectAnswers}</ScoreDetailValue>
          </ScoreDetailItem>
          {pendingAnswers > 0 && (
            <ScoreDetailItem>
              <ScoreDetailLabel>Тексерілмеген жауаптар:</ScoreDetailLabel>
              <ScoreDetailValue pending>{pendingAnswers}</ScoreDetailValue>
            </ScoreDetailItem>
          )}
        </ScoreDetails>
      </ScoreSection>

      <AnswersSection>
        <SectionTitle>Сіздің жауаптарыңыз</SectionTitle>

        {results.answers.map((answer, index) => {
          const question = answer.question;

          return (
            <AnswerContainer key={answer.id} status={answer.is_correct}>
              <QuestionNumber>Сұрақ {index + 1}</QuestionNumber>
              <QuestionText>{question.text}</QuestionText>
              <QuestionPoints>{question.points} ұпай</QuestionPoints>

              {question.question_type === "MCQ" ? (
                <ChoicesList>
                  {question.choices.map((choice) => {
                    const isSelected = answer.selected_choices?.some(
                      (sc) => sc.id === choice.id
                    );
                    const isCorrect = choice.is_correct;

                    return (
                      <ChoiceItem
                        key={choice.id}
                        selected={isSelected}
                        correct={isCorrect}
                      >
                        <ChoiceIcon selected={isSelected} correct={isCorrect} />
                        <ChoiceText>{choice.text}</ChoiceText>
                      </ChoiceItem>
                    );
                  })}
                </ChoicesList>
              ) : (
                <OpenAnswerResult>
                  <OpenAnswerSection>
                    <OpenAnswerLabel>Сіздің жауабыңыз:</OpenAnswerLabel>
                    <OpenAnswerText>
                      {answer.text_answer || "(Жауап берілмеді)"}
                    </OpenAnswerText>
                  </OpenAnswerSection>

                  {answer.feedback && (
                    <OpenAnswerSection>
                      <OpenAnswerLabel>Оқытушы пікірі:</OpenAnswerLabel>
                      <OpenAnswerText>{answer.feedback}</OpenAnswerText>
                    </OpenAnswerSection>
                  )}
                </OpenAnswerResult>
              )}

              <AnswerStatus status={answer.is_correct}>
                {answer.is_correct === true && "Дұрыс ✓"}
                {answer.is_correct === false && "Қате ✗"}
                {answer.is_correct === null && "Тексерілуде..."}
              </AnswerStatus>
            </AnswerContainer>
          );
        })}
      </AnswersSection>
    </ResultsContainer>
  );
};

export default TestResults;

// Styled Components
const ResultsContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
`;

const TestTitle = styled.h1`
  font-size: 24px;
  color: #333;
  margin: 0;
`;

const ResultsStatus = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: ${(props) => (props.passed ? "#5cb85c" : "#d9534f")};
  padding: 5px 15px;
  border-radius: 20px;
  background-color: ${(props) =>
    props.passed ? "rgba(92, 184, 92, 0.1)" : "rgba(217, 83, 79, 0.1)"};
`;

const ScoreSection = styled.div`
  display: flex;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ScoreCircle = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-right: 30px;
  border: 8px solid
    ${(props) => (props.score >= props.passingScore ? "#5cb85c" : "#d9534f")};

  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 20px;
  }
`;

const ScoreValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #333;
`;

const PassingScore = styled.div`
  font-size: 14px;
  color: #777;
  margin-top: 5px;
`;

const ScoreDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ScoreDetailItem = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const ScoreDetailLabel = styled.div`
  font-weight: bold;
  color: #555;
  width: 180px;
`;

const ScoreDetailValue = styled.div`
  color: ${(props) => {
    if (props.correct) return "#5cb85c";
    if (props.incorrect) return "#d9534f";
    if (props.pending) return "#f0ad4e";
    return "#333";
  }};
  font-weight: ${(props) =>
    props.correct || props.incorrect || props.pending ? "bold" : "normal"};
`;

const AnswersSection = styled.div`
  margin-top: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  color: #333;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const AnswerContainer = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  position: relative;

  border-left: 5px solid
    ${(props) => {
      if (props.status === true) return "#5cb85c";
      if (props.status === false) return "#d9534f";
      return "#f0ad4e";
    }};
`;

const QuestionNumber = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #777;
  margin-bottom: 5px;
`;

const QuestionText = styled.div`
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
`;

const QuestionPoints = styled.div`
  font-size: 12px;
  color: #777;
  margin-bottom: 15px;
`;

const ChoicesList = styled.div`
  margin-bottom: 15px;
`;

const ChoiceItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 5px;
  background-color: ${(props) => {
    if (props.selected && props.correct) return "rgba(92, 184, 92, 0.1)";
    if (props.selected && !props.correct) return "rgba(217, 83, 79, 0.1)";
    if (!props.selected && props.correct) return "rgba(92, 184, 92, 0.05)";
    return "transparent";
  }};
  border: 1px solid
    ${(props) => {
      if (props.selected && props.correct) return "#5cb85c";
      if (props.selected && !props.correct) return "#d9534f";
      if (!props.selected && props.correct) return "#5cb85c";
      return "#eee";
    }};
`;

const ChoiceIcon = styled.span`
  width: 20px;
  height: 20px;
  margin-right: 10px;
  border-radius: 50%;
  display: inline-block;

  background-color: ${(props) => {
    if (props.selected && props.correct) return "#5cb85c";
    if (props.selected && !props.correct) return "#d9534f";
    if (!props.selected && props.correct) return "white";
    return "white";
  }};

  border: 2px solid
    ${(props) => {
      if (props.selected && props.correct) return "#5cb85c";
      if (props.selected && !props.correct) return "#d9534f";
      if (!props.selected && props.correct) return "#5cb85c";
      return "#ddd";
    }};

  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${(props) => {
      if (props.selected) return "white";
      if (!props.selected && props.correct) return "#5cb85c";
      return "transparent";
    }};
  }
`;

const ChoiceText = styled.span`
  font-size: 16px;
  color: #333;
`;

const OpenAnswerResult = styled.div`
  margin-bottom: 15px;
`;

const OpenAnswerSection = styled.div`
  margin-bottom: 10px;
`;

const OpenAnswerLabel = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
`;

const OpenAnswerText = styled.div`
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 5px;
  background-color: #f9f9f9;
  white-space: pre-wrap;
  overflow-wrap: break-word;
`;

const AnswerStatus = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;

  color: ${(props) => {
    if (props.status === true) return "#5cb85c";
    if (props.status === false) return "#d9534f";
    return "#f0ad4e";
  }};

  background-color: ${(props) => {
    if (props.status === true) return "rgba(92, 184, 92, 0.1)";
    if (props.status === false) return "rgba(217, 83, 79, 0.1)";
    return "rgba(240, 173, 78, 0.1)";
  }};
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
