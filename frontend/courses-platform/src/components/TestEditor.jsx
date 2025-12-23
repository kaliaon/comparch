import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { testService } from "../services";

const TestEditor = ({ lessonId, testId, onSave }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [test, setTest] = useState({
    title: "",
    description: "",
    time_limit_minutes: 30,
    passing_score: 70,
    questions: [],
  });

  // Load existing test if testId is provided
  useEffect(() => {
    const loadTest = async () => {
      if (!testId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await testService.getTestDetails(testId);

        if (!response.success) {
          throw new Error(
            response.message || "Тест ақпаратын жүктеу мүмкін болмады"
          );
        }

        setTest(response.data);
        setLoading(false);
      } catch (err) {
        setError(
          err.message || "Тест ақпаратын жүктеу кезінде қате пайда болды"
        );
        setLoading(false);
      }
    };

    loadTest();
  }, [testId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTest((prev) => ({
      ...prev,
      [name]:
        name === "time_limit_minutes" || name === "passing_score"
          ? parseInt(value, 10) || 0
          : value,
    }));
  };

  // Add a new question
  const addQuestion = (type = "MCQ") => {
    const newQuestion = {
      tempId: Date.now(), // Temporary ID for frontend identification
      text: "",
      question_type: type,
      points: 10,
      choices:
        type === "MCQ"
          ? [
              { tempId: Date.now() + 1, text: "", is_correct: false },
              { tempId: Date.now() + 2, text: "", is_correct: false },
            ]
          : [],
    };

    setTest((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  // Remove a question
  const removeQuestion = (questionIndex) => {
    setTest((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== questionIndex),
    }));
  };

  // Handle question changes
  const handleQuestionChange = (questionIndex, field, value) => {
    setTest((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: field === "points" ? parseInt(value, 10) || 0 : value,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Add a new choice to a question
  const addChoice = (questionIndex) => {
    setTest((prev) => {
      const updatedQuestions = [...prev.questions];
      const newChoice = {
        tempId: Date.now(), // Temporary ID for frontend identification
        text: "",
        is_correct: false,
      };

      updatedQuestions[questionIndex].choices.push(newChoice);
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Remove a choice from a question
  const removeChoice = (questionIndex, choiceIndex) => {
    setTest((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex].choices = updatedQuestions[
        questionIndex
      ].choices.filter((_, index) => index !== choiceIndex);
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Handle choice changes
  const handleChoiceChange = (questionIndex, choiceIndex, field, value) => {
    setTest((prev) => {
      const updatedQuestions = [...prev.questions];
      const updatedChoices = [...updatedQuestions[questionIndex].choices];

      updatedChoices[choiceIndex] = {
        ...updatedChoices[choiceIndex],
        [field]: field === "is_correct" ? value : value,
      };

      updatedQuestions[questionIndex].choices = updatedChoices;
      return { ...prev, questions: updatedQuestions };
    });
  };

  // Save the test
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate test data
      if (!test.title.trim()) {
        throw new Error("Тест тақырыбын көрсетіңіз");
      }

      if (test.questions.length === 0) {
        throw new Error("Тест кем дегенде бір сұрақтан тұруы керек");
      }

      // Validate each question
      for (let i = 0; i < test.questions.length; i++) {
        const question = test.questions[i];

        if (!question.text.trim()) {
          throw new Error(`Сұрақ ${i + 1}: Сұрақ мәтінін көрсетіңіз`);
        }

        if (question.question_type === "MCQ") {
          if (question.choices.length < 2) {
            throw new Error(
              `Сұрақ ${i + 1}: Кем дегенде екі жауап нұсқасын көрсетіңіз`
            );
          }

          if (!question.choices.some((choice) => choice.is_correct)) {
            throw new Error(
              `Сұрақ ${i + 1}: Кем дегенде бір дұрыс жауап көрсетіңіз`
            );
          }

          for (let j = 0; j < question.choices.length; j++) {
            if (!question.choices[j].text.trim()) {
              throw new Error(
                `Сұрақ ${i + 1}, Жауап ${j + 1}: Жауап мәтінін көрсетіңіз`
              );
            }
          }
        }
      }

      // Format data for API
      const testData = {
        ...test,
        lesson: lessonId,
        questions: test.questions.map((q) => ({
          id: q.id, // Include ID if it exists
          text: q.text,
          question_type: q.question_type,
          points: q.points,
          choices:
            q.question_type === "MCQ"
              ? q.choices.map((c) => ({
                  id: c.id, // Include ID if it exists
                  text: c.text,
                  is_correct: c.is_correct,
                }))
              : [],
        })),
      };

      let response;

      if (testId) {
        // Update existing test
        response = await testService.updateTest(testId, testData);
      } else {
        // Create new test
        response = await testService.createLessonTest(lessonId, testData);
      }

      if (!response.success) {
        throw new Error(response.message || "Тестті сақтау мүмкін болмады");
      }

      // Call onSave callback with the saved test
      if (onSave) {
        onSave(response.data);
      }

      setSaving(false);
    } catch (err) {
      setError(err.message || "Тестті сақтау кезінде қате пайда болды");
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingContainer>Жүктелуде...</LoadingContainer>;
  }

  return (
    <EditorContainer>
      <EditorHeader>
        <EditorTitle>{testId ? "Тестті өңдеу" : "Жаңа тест құру"}</EditorTitle>
      </EditorHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <FormSection>
        <SectionTitle>Негізгі ақпарат</SectionTitle>

        <FormGroup>
          <Label htmlFor="title">Тест тақырыбы *</Label>
          <Input
            id="title"
            name="title"
            value={test.title}
            onChange={handleInputChange}
            placeholder="Тест тақырыбын енгізіңіз"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">Сипаттама</Label>
          <Textarea
            id="description"
            name="description"
            value={test.description}
            onChange={handleInputChange}
            placeholder="Тест сипаттамасын енгізіңіз"
            rows={3}
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label htmlFor="time_limit_minutes">Уақыт шегі (минут)</Label>
            <Input
              id="time_limit_minutes"
              name="time_limit_minutes"
              type="number"
              min={0}
              value={test.time_limit_minutes}
              onChange={handleInputChange}
            />
            <HelpText>0 = шектеусіз</HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="passing_score">Өту шегі (%)</Label>
            <Input
              id="passing_score"
              name="passing_score"
              type="number"
              min={0}
              max={100}
              value={test.passing_score}
              onChange={handleInputChange}
            />
          </FormGroup>
        </FormRow>
      </FormSection>

      <FormSection>
        <SectionTitleRow>
          <SectionTitle>Сұрақтар</SectionTitle>
          <ButtonGroup>
            <Button onClick={() => addQuestion("MCQ")} type="button">
              + Тест сұрағы
            </Button>
            <Button onClick={() => addQuestion("OPEN")} type="button" secondary>
              + Ашық сұрақ
            </Button>
          </ButtonGroup>
        </SectionTitleRow>

        {test.questions.length === 0 ? (
          <EmptyState>
            Сұрақтар қосылмаған. Сұрақ қосу үшін жоғарыдағы түймелерді
            пайдаланыңыз.
          </EmptyState>
        ) : (
          test.questions.map((question, questionIndex) => (
            <QuestionCard key={question.id || question.tempId}>
              <QuestionHeader>
                <QuestionTypeLabel>
                  {question.question_type === "MCQ"
                    ? "Тест сұрағы"
                    : "Ашық сұрақ"}
                </QuestionTypeLabel>
                <RemoveButton
                  onClick={() => removeQuestion(questionIndex)}
                  title="Сұрақты жою"
                >
                  ✕
                </RemoveButton>
              </QuestionHeader>

              <FormGroup>
                <Label>Сұрақ мәтіні *</Label>
                <Textarea
                  value={question.text}
                  onChange={(e) =>
                    handleQuestionChange(questionIndex, "text", e.target.value)
                  }
                  placeholder="Сұрақты енгізіңіз"
                  rows={2}
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>Ұпайлар</Label>
                  <Input
                    type="number"
                    min={1}
                    value={question.points}
                    onChange={(e) =>
                      handleQuestionChange(
                        questionIndex,
                        "points",
                        e.target.value
                      )
                    }
                  />
                </FormGroup>
              </FormRow>

              {question.question_type === "MCQ" && (
                <ChoicesSection>
                  <ChoicesHeader>
                    <ChoicesTitle>Жауап нұсқалары</ChoicesTitle>
                    <Button
                      onClick={() => addChoice(questionIndex)}
                      type="button"
                      small
                    >
                      + Жауап нұсқасы
                    </Button>
                  </ChoicesHeader>

                  {question.choices.map((choice, choiceIndex) => (
                    <ChoiceRow key={choice.id || choice.tempId}>
                      <Checkbox
                        type="checkbox"
                        checked={choice.is_correct}
                        onChange={(e) =>
                          handleChoiceChange(
                            questionIndex,
                            choiceIndex,
                            "is_correct",
                            e.target.checked
                          )
                        }
                        id={`choice-correct-${questionIndex}-${choiceIndex}`}
                      />
                      <ChoiceInput
                        value={choice.text}
                        onChange={(e) =>
                          handleChoiceChange(
                            questionIndex,
                            choiceIndex,
                            "text",
                            e.target.value
                          )
                        }
                        placeholder="Жауап мәтіні"
                      />
                      <RemoveButton
                        onClick={() => removeChoice(questionIndex, choiceIndex)}
                        title="Жауапты жою"
                        small
                      >
                        ✕
                      </RemoveButton>
                    </ChoiceRow>
                  ))}

                  {question.choices.length < 2 && (
                    <HelpText>Кем дегенде екі жауап нұсқасы қажет</HelpText>
                  )}
                </ChoicesSection>
              )}
            </QuestionCard>
          ))
        )}
      </FormSection>

      <ActionButtons>
        <Button onClick={handleSave} disabled={saving} primary>
          {saving ? "Сақталуда..." : "Сақтау"}
        </Button>
      </ActionButtons>
    </EditorContainer>
  );
};

export default TestEditor;

// Styled Components
const EditorContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
`;

const EditorTitle = styled.h1`
  font-size: 24px;
  color: #333;
  margin: 0;
`;

const FormSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  color: #333;
  margin: 0 0 15px 0;
`;

const SectionTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #5b86e5;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: inherit;
  font-size: 16px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #5b86e5;
  }
`;

const HelpText = styled.div`
  font-size: 12px;
  color: #777;
  margin-top: 5px;
`;

const Button = styled.button`
  padding: ${(props) => (props.small ? "5px 10px" : "10px 15px")};
  background-color: ${(props) =>
    props.secondary ? "#f0f0f0" : props.primary ? "#5b86e5" : "#36b37e"};
  color: ${(props) => (props.secondary ? "#333" : "white")};
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: ${(props) =>
      props.secondary ? "#e0e0e0" : props.primary ? "#4a75d4" : "#2da36d"};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const EmptyState = styled.div`
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 5px;
  text-align: center;
  color: #777;
`;

const QuestionCard = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const QuestionTypeLabel = styled.div`
  font-weight: bold;
  color: #5b86e5;
`;

const RemoveButton = styled.button`
  width: ${(props) => (props.small ? "24px" : "28px")};
  height: ${(props) => (props.small ? "24px" : "28px")};
  background-color: ${(props) => (props.small ? "#f0f0f0" : "#ffeeee")};
  color: ${(props) => (props.small ? "#777" : "#d9534f")};
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.small ? "#e0e0e0" : "#ffd7d7")};
  }
`;

const ChoicesSection = styled.div`
  margin-top: 15px;
`;

const ChoicesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ChoicesTitle = styled.h3`
  font-size: 16px;
  color: #555;
  margin: 0;
`;

const ChoiceRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const ChoiceInput = styled.input`
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  margin-right: 5px;

  &:focus {
    outline: none;
    border-color: #5b86e5;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const ErrorMessage = styled.div`
  padding: 10px 15px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #777;
`;
