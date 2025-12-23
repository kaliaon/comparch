import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Quiz from "../components/Quiz";
import styled from "styled-components";
import Header from "../components/Header";
import { courseService } from "../services";
import { AIChatButton } from "../components/index";
import { convertToEmbedUrl, isValidYouTubeUrl } from "../utils/videoUtils";

const LessonPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { courseId, lessonId } = params;

  const [data, setData] = useState();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLesson = useCallback(async () => {
    try {
      setLoading(true);
      const result = await courseService.getLessonDetails(lessonId);

      if (!result.success) {
        throw new Error(
          result.message || "An error occurred while fetching lesson data"
        );
      }

      return result.data;
    } catch (error) {
      console.error(error);
      setError(error.message);

      // Check if we need to redirect to login
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) {
        navigate("/login");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [lessonId, navigate]);

  const fetchTestData = useCallback(async () => {
    if (!lessonId) return null;

    try {
      setTestLoading(true);
      const result = await courseService.getLessonTest(lessonId);

      if (!result.success) {
        console.warn("Failed to fetch test data:", result.message);
        return null;
      }

      return result.data;
    } catch (error) {
      console.error("Error fetching test data:", error);
      return null;
    } finally {
      setTestLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/login");
      return;
    }

    fetchLesson().then((fetchedData) => {
      if (fetchedData) {
        setData(fetchedData);

        // If the lesson has a test, fetch the test data
        if (fetchedData.has_test) {
          fetchTestData().then((fetchedTestData) => {
            if (fetchedTestData) {
              setTestData(fetchedTestData);
            }
          });
        }
      }
    });
  }, [navigate, fetchLesson, fetchTestData]);

  // Handle the back button click
  const handleBackClick = () => {
    // Extract the course ID from the URL if not available directly
    const pathParts = window.location.pathname.split("/");
    const courseIndex = pathParts.indexOf("course");

    if (courseIndex !== -1 && pathParts[courseIndex + 1]) {
      // Navigate back to the course page using the course ID from the URL
      navigate(`/course/${pathParts[courseIndex + 1]}`);
    } else {
      // Fallback to just going back in history
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container>
          <LoadingText>Сабақ деректері жүктелуде...</LoadingText>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container>
          <ErrorContainer>
            <ErrorText>{error}</ErrorText>
            <ErrorButton onClick={() => window.location.reload()}>
              Қайта көру
            </ErrorButton>
          </ErrorContainer>
        </Container>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Header />
        <Container>
          <Title>Сабақ деректері қолжетімді емес</Title>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container>
        <BackButton onClick={handleBackClick}>
          <BackIcon>←</BackIcon> Курсқа оралу
        </BackButton>

        <ContentContainer>
          <Title>{data.title}</Title>
          <VideoContainer>
            <iframe
              width="900"
              height="500"
              src={convertToEmbedUrl(data.video_url)}
              title="Сабақ бейнесі"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
            {!isValidYouTubeUrl(data.video_url) && (
              <VideoWarning>
                Ескерту: Бұл YouTube бейнесі емес. Кейбір функциялар жұмыс
                істемеуі мүмкін.
              </VideoWarning>
            )}
            {/* Video Container End */}
          </VideoContainer>

          <DescriptionContainer>
            <DescriptionTitle>Сабақ туралы</DescriptionTitle>
            <DescriptionContent
              dangerouslySetInnerHTML={{ __html: data.description || "Сипаттама жоқ." }}
            />
            {data.title === "Енгізу-Шығару Құрылғылары және Жүйелік Шиналар" && (
              <BusArchitectureInteractive />
            )}
            {data.title === "Жад Иерархиясы" && (
              <MemoryHierarchyInteractive />
            )}
          </DescriptionContainer>

          {data.has_test ? (
            testLoading ? (
              <QuizPlaceholder>Тест жүктелуде...</QuizPlaceholder>
            ) : testData ? (
              <Quiz
                quizData={testData}
                nextLessonId={data.next_lesson_id}
                courseId={courseId}
              />
            ) : (
              <QuizPlaceholder>
                Тест деректерін жүктеу мүмкін болмады. Өтінеміз, кейінірек қайта
                көріңіз.
              </QuizPlaceholder>
            )
          ) : Array.isArray(data.quiz) && data.quiz.length > 0 ? (
            <Quiz quizData={data.quiz} />
          ) : (
            <QuizPlaceholder>
              Бұл сабақ үшін тест қолжетімді емес.
            </QuizPlaceholder>
          )}
        </ContentContainer>
        <AIChatButton
          courseId={courseId}
          lessonId={lessonId}
          lessonTitle={data.title}
        />

        <BottomNavigation>
          {data.prev_lesson_id ? (
            <NavButton onClick={() => navigate(`/course/${courseId}/lesson/${data.prev_lesson_id}`)}>
              ← Алдыңғы тақырып
            </NavButton>
          ) : <div />}

          {data.next_lesson_id ? (
            <NavButton primary onClick={() => navigate(`/course/${courseId}/lesson/${data.next_lesson_id}`)}>
              Келесі тақырып →
            </NavButton>
          ) : <div />}
        </BottomNavigation>
      </Container>
    </>
  );
};

export default LessonPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: #f9f9f9;
  min-height: calc(100vh - 70px);
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
`;

const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  font-weight: 500;
  color: #3066be;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background: #f0f5ff;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
`;

const BackIcon = styled.span`
  margin-right: 6px;
  font-size: 18px;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #3066be;
  margin-bottom: 30px;
  text-align: center;
`;

const VideoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  width: 100%;
  height: auto;

  iframe {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 980px) {
    iframe {
      width: 100%;
      height: 350px;
    }
  }

  @media (max-width: 768px) {
    iframe {
      height: 300px;
    }
  }
`;

const LoadingText = styled.p`
  font-size: 18px;
  color: #333;
  margin-top: 100px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  width: 100%;
  max-width: 600px;
  margin: 80px auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const ErrorText = styled.p`
  font-size: 18px;
  color: #ff3333;
  margin-bottom: 20px;
  text-align: center;
`;

const ErrorButton = styled.button`
  padding: 10px 20px;
  background: #3066be;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;

  &:hover {
    background: #254d95;
  }
`;

const QuizPlaceholder = styled.div`
  width: 100%;
  max-width: 800px;
  margin-top: 20px;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 10px;
  text-align: center;
  color: #666;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const VideoWarning = styled.div`
  width: 100%;
  max-width: 800px;
  margin-top: 10px;
  padding: 15px;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  text-align: center;
  color: #856404;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const DescriptionContainer = styled.div`
  width: 100%;
  max-width: 900px;
  margin-bottom: 40px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;

const DescriptionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
`;

const DescriptionContent = styled.div`
  line-height: 1.8;
  color: #444;
  font-size: 1.1rem;

  h3 {
    margin-top: 25px;
    margin-bottom: 15px;
    color: #3066be;
  }

  ul {
    margin-bottom: 20px;
    padding-left: 20px;
  }

  li {
    margin-bottom: 10px;
  }

  .schema-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin: 30px 0;
    align-items: center;
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
  }

  .schema-level {
    background: white;
    border: 2px solid #3066be;
    color: #3066be;
    padding: 15px 30px;
    border-radius: 8px;
    font-weight: bold;
    width: 250px;
    text-align: center;
    position: relative;
    cursor: help;
    transition: all 0.3s;
    
    &:hover {
      background: #3066be;
      color: white;
    }

    &:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      left: 105%; /* Position to the right */
      top: 50%;
      transform: translateY(-50%);
      background: #333;
      color: white;
      padding: 10px;
      border-radius: 5px;
      width: 200px;
      font-size: 0.9rem;
      font-weight: normal;
      z-index: 100;
      pointer-events: none;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    
    /* Small arrow for tooltip */
    &:hover::before {
      content: '';
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      border-width: 6px;
      border-style: solid;
      border-color: transparent #333 transparent transparent;
    }
  }

  .arrow-down {
    font-size: 24px;
    color: #aaa;
  }

  /* Table Styles */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 0.95rem;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
  }
  
  th {
    background-color: #f2f2f2;
    color: #333;
    font-weight: 600;
  }
  
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  /* Cycle Schema Styles */
  .cycle-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin: 30px 0;
    flex-wrap: wrap;
  }
  
  .cycle-step {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #3066be;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    text-align: center;
    box-shadow: 0 4px 10px rgba(48, 102, 190, 0.3);
    position: relative;
    z-index: 1;
  }

  .cycle-arrow {
    font-size: 24px;
    color: #3066be;
    font-weight: bold;
  }
  
  /* Pipeline Diagram Styles */
  .pipeline-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 30px 0;
    font-family: monospace;
    overflow-x: auto;
  }
  .pipeline-row {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .pipeline-label {
    min-width: 100px;
    font-weight: bold;
    color: #444;
  }
  .pipe-stage {
    width: 60px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    color: white;
    font-size: 0.8em;
    font-weight: bold;
  }
  .st-fetch { background-color: #ef5350; }
  .st-decode { background-color: #42a5f5; }
  .st-execute { background-color: #66bb6a; }
  .st-mem { background-color: #ffa726; }
  .st-write { background-color: #ab47bc; }
  .st-empty { background-color: transparent; width: 60px; }

  /* Multicore Diagram Styles */
  .multicore-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    padding: 20px;
    background: #e3f2fd;
    border: 3px solid #1565c0;
    border-radius: 12px;
    margin: 30px 0;
    position: relative;
  }
  .core-box {
    width: 120px;
    height: 120px;
    background: #fff;
    border: 2px solid #1976d2;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    color: #1565c0;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  .shared-cache {
    width: 100%;
    height: 50px;
    background: #90caf9;
    border: 2px dashed #0d47a1;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    color: #0d47a1;
    margin-top: 20px;
  }


  /* Processor Schema Styles */
  .proc-schema-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    margin: 30px 0;
    padding: 20px;
    background-color: #f0f4f8;
    border-radius: 10px;
    border: 1px dashed #3066be;
    position: relative;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .proc-block {
    padding: 15px;
    background: white;
    border: 2px solid #3066be;
    border-radius: 8px;
    text-align: center;
    font-weight: bold;
    color: #333;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 2;
    min-width: 120px;
  }

  .proc-cu {
    width: 100%;
    background-color: #fff9c4; /* Yellowish for Control */
  }

  .proc-alu {
    background-color: #ffccbc; /* Reddish for ALU */
    flex: 1;
  }

  .proc-regs {
    background-color: #c5cae9; /* Blueish for Registers */
    flex: 1;
  }

  .proc-bus {
    width: 100%;
    background-color: #cfd8dc;
    color: #455a64;
    border: none;
    margin-top: 10px;
  }

  .proc-arrow-down {
    width: 100%;
    text-align: center;
    font-size: 24px;
    color: #3066be;
    margin: -10px 0;
    z-index: 1;
  }

  /* Pyramid Diagram Styles */
  .pyramid-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 40px auto;
    width: 100%;
    max-width: 600px;
  }

  .pyramid-level {
    text-align: center;
    color: white;
    font-weight: bold;
    padding: 10px;
    margin-bottom: 5px;
    position: relative;
    cursor: default;
    transition: transform 0.2s;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }

  .pyramid-level:hover {
    transform: scale(1.02);
  }

  .pyr-1-regs {
    width: 20%;
    background-color: #e53935; /* Red */
    border-radius: 10px 10px 0 0;
    z-index: 4;
  }

  .pyr-2-cache {
    width: 40%;
    background-color: #fb8c00; /* Orange */
    z-index: 3;
  }

  .pyr-3-ram {
    width: 60%;
    background-color: #43a047; /* Green */
    z-index: 2;
  }

  .pyr-4-storage {
    width: 80%;
    background-color: #1e88e5; /* Blue */
    border-radius: 0 0 10px 10px;
    z-index: 1;
  }

  .pyr-arrow-up {
    position: absolute;
    right: -100px;
    top: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #555;
    font-size: 0.9rem;
  }

  .pyr-arrow-line {
    width: 2px;
    height: 100%;
    background: linear-gradient(to top, #1e88e5, #e53935);
  }

  .pyr-label-speed {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    margin-right: 10px;
  }

  /* IO System Diagram Styles */
  .io-system-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin: 40px 0;
    padding: 20px;
    background-color: #fafafa;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    width: 100%;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }

  .io-bus-container {
    display: flex;
    justify-content: space-around;
    width: 100%;
    position: relative;
    padding-bottom: 40px; /* Space for the bus lines */
  }

  .io-component {
    width: 120px;
    height: 80px;
    background-color: white;
    border: 2px solid #3066be;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-weight: bold;
    color: #333;
    z-index: 2;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  }

  .io-cpu { background-color: #fff9c4; }
  .io-mem { background-color: #c8e6c9; }
  .io-device { background-color: #e1bee7; }

  .bus-lines {
    position: absolute;
    bottom: 0;
    left: 10%;
    width: 80%;
    height: 30px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 1;
  }

  .bus-line {
    width: 100%;
    height: 6px;
    background-color: #546e7a;
    border-radius: 3px;
    position: relative;
  }

  .bus-connection {
    position: absolute;
    width: 4px;
    height: 20px;
    background-color: #3066be;
    top: -20px;
   }
   
   /* Connections placement */
   .conn-cpu { left: 15%; height: 50px; top: -50px; }
   .conn-mem { left: 50%; height: 50px; top: -50px; }
   .conn-io { left: 85%; height: 50px; top: -50px; }

   .bus-label {
       text-align: center;
       font-size: 0.8rem;
       color: #666;
       margin-top: 5px;
   }
`;

const BottomNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 900px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  gap: 20px;
`;

const NavButton = styled.button`
  padding: 12px 24px;
  border: ${props => props.primary ? 'none' : '1px solid #3066be'};
  background: ${props => props.primary ? '#3066be' : 'white'};
  color: ${props => props.primary ? 'white' : '#3066be'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.primary ? '#254e99' : '#f0f5ff'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const MemoryHierarchyInteractive = () => {
  const initialItems = [
    { id: 'ram', text: 'Жедел жад (RAM)' },
    { id: 'cache', text: 'Кэш-жад (Cache)' },
    { id: 'storage', text: 'Сыртқы жад (HDD/SSD)' },
    { id: 'regs', text: 'Регистрлер (Registers)' }
  ];

  const correctOrder = ['regs', 'cache', 'ram', 'storage'];

  const [items, setItems] = useState(initialItems);
  const [feedback, setFeedback] = useState(null);

  const moveItem = (index, direction) => {
    const newItems = [...items];
    const newIndex = index + direction;

    if (newIndex >= 0 && newIndex < items.length) {
      const temp = newItems[index];
      newItems[index] = newItems[newIndex];
      newItems[newIndex] = temp;
      setItems(newItems);
      setFeedback(null);
    }
  };

  const checkOrder = () => {
    const currentOrder = items.map(item => item.id);
    const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(correctOrder);

    if (isCorrect) {
      setFeedback({
        type: 'success',
        text: 'Керемет! Сіз иерархияны дұрыс реттедіңіз: Регистрлер → Кэш → Жедел жад → Сыртқы жад.'
      });
    } else {
      setFeedback({
        type: 'error',
        text: 'Қате. Есте сақтаңыз: неғұрлым жылдам жад процессорға жақын және көлемі азырақ болады. Қайта көріңіз!'
      });
    }
  };

  return (
    <HierarchyContainer>
      <BusInteractionTitle>Интерактивті тапсырма: Жад иерархиясын реттеңіз</BusInteractionTitle>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Жад түрлерін ең жылдамнан (жоғарыда) ең баяуға (төменде) қарай ретпен орналастырыңыз.
      </p>

      <HierarchyList>
        {items.map((item, index) => (
          <HierarchyItem key={item.id}>
            <ItemText>{index + 1}. {item.text}</ItemText>
            <Controls>
              <ControlButton
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                title="Жоғары көтеру"
              >
                ↑
              </ControlButton>
              <ControlButton
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
                title="Төмен түсіру"
              >
                ↓
              </ControlButton>
            </Controls>
          </HierarchyItem>
        ))}
      </HierarchyList>

      <CheckButton onClick={checkOrder}>Тексеру</CheckButton>

      {feedback && (
        <FeedbackBox type={feedback.type}>
          {feedback.text}
        </FeedbackBox>
      )}
    </HierarchyContainer>
  );
};

const BusArchitectureInteractive = () => {
  const [selected, setSelected] = useState(null);

  const data = {
    cpu: {
      title: "Процессор",
      activeBuses: ["address", "data", "control"],
      desc: "Процессор жүйелік шинаға қосылған: Адрестік шина арқылы жад ұяшығын немесе құрылғыны көрсетеді, Деректер шинасы арқылы ақпарат алмасады, Басқару шинасы арқылы оқу/жазу командаларын береді."
    },
    memory: {
      title: "Жад",
      activeBuses: ["data", "control"],
      desc: "Жад жүйелік шинаға қосылған: Процессор жіберген адресті қабылдап, Басқару шинасындағы сигналдарға сәйкес Деректер шинасы арқылы ақпаратты жібереді немесе қабылдайды."
    },
    io: {
      title: "Енгізу-шығару",
      activeBuses: ["data", "control"],
      desc: "Енгізу-шығару құрылғылары жүйелік шинаға қосылған: Басқару шинасынан сигналдар қабылдап, Деректер шинасы арқылы процессормен ақпарат алмасады."
    }
  };

  const handleSelect = (key) => {
    setSelected(key);
  };

  return (
    <BusInteractionContainer>
      <BusInteractionTitle>Интерактивті Схема: Құрылғыны таңдаңыз</BusInteractionTitle>

      <BusComponentsRow>
        <BusCompButton
          active={selected === 'cpu'}
          onClick={() => handleSelect('cpu')}
        >
          Процессор
        </BusCompButton>
        <BusCompButton
          active={selected === 'memory'}
          onClick={() => handleSelect('memory')}
        >
          Жад
        </BusCompButton>
        <BusCompButton
          active={selected === 'io'}
          onClick={() => handleSelect('io')}
        >
          Енгізу-шығару
        </BusCompButton>
      </BusComponentsRow>

      <BusVisualization>
        <BusTrack active={selected && data[selected].activeBuses.includes('control')}>
          Басқару Шинасы (Control Bus)
        </BusTrack>
        <BusTrack active={selected && data[selected].activeBuses.includes('address')}>
          Адрестік Шина (Address Bus)
        </BusTrack>
        <BusTrack active={selected && data[selected].activeBuses.includes('data')}>
          Деректер Шинасы (Data Bus)
        </BusTrack>
      </BusVisualization>

      <BusInfoPanel>
        <BusInfoText>
          {selected ? data[selected].desc : "Құрылғылардың шиналармен қалай байланысатынын көру үшін жоғарыдағы батырмаларды басыңыз."}
        </BusInfoText>
      </BusInfoPanel>
    </BusInteractionContainer>
  );
};

/* Styled Components for Bus Interaction */
const BusInteractionContainer = styled.div`
  margin-top: 40px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  text-align: center;
`;

const BusInteractionTitle = styled.h3`
  color: #3066be;
  margin-bottom: 20px;
`;

const BusComponentsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
`;

const BusCompButton = styled.button`
  padding: 15px 25px;
  border: 2px solid ${props => props.active ? '#3066be' : '#ccc'};
  background: ${props => props.active ? '#3066be' : '#f9f9f9'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  color: ${props => props.active ? 'white' : '#555'};
  transition: all 0.3s ease;
  min-width: 150px;
  box-shadow: ${props => props.active ? '0 4px 10px rgba(48, 102, 190, 0.3)' : 'none'};

  &:hover {
    border-color: #3066be;
    color: ${props => props.active ? 'white' : '#3066be'};
    background: ${props => props.active ? '#3066be' : '#eef4ff'};
  }
`;

const BusVisualization = styled.div`
  position: relative;
  height: 200px;
  background: #f0f4f8;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 20px;
`;

const BusTrack = styled.div`
  width: 90%;
  height: 30px;
  background: ${props => props.active ? '#ffd54f' : '#e0e0e0'};
  color: ${props => props.active ? '#333' : '#777'};
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  position: relative;
  transition: all 0.3s;
  box-shadow: ${props => props.active ? '0 0 10px rgba(255, 213, 79, 0.5)' : 'none'};
  transform: ${props => props.active ? 'scale(1.02)' : 'scale(1)'};
`;

const BusInfoPanel = styled.div`
  background: #e8f5e9;
  padding: 15px;
  border-radius: 8px;
  border-left: 5px solid #2e7d32;
  text-align: left;
  min-height: 80px;
`;

const BusInfoText = styled.p`
  margin: 0;
  color: #2e7d32;
  font-size: 0.95rem;
  line-height: 1.5;
`;
const HierarchyContainer = styled.div`
  margin-top: 40px;
  padding: 30px;
  background: #fdfdfd;
  border: 1px solid #e0e0e0;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
`;

const HierarchyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 500px;
  margin: 0 auto 25px;
`;

const HierarchyItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: white;
  border: 1px solid #eee;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
  transition: transform 0.2s;

  &:hover {
    transform: translateX(5px);
    border-color: #3066be;
  }
`;

const ItemText = styled.span`
  font-weight: 500;
  color: #333;
`;

const Controls = styled.div`
  display: flex;
  gap: 8px;
`;

const ControlButton = styled.button`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background: #f9f9f9;
  border-radius: 4px;
  cursor: pointer;
  color: #555;
  font-weight: bold;
  
  &:hover:not(:disabled) {
    background: #3066be;
    color: white;
    border-color: #3066be;
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const CheckButton = styled.button`
  padding: 12px 40px;
  background: #3066be;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #254d95;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(48, 102, 190, 0.3);
  }
`;

const FeedbackBox = styled.div`
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  font-weight: 500;
  background: ${props => props.type === 'success' ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.type === 'success' ? '#2e7d32' : '#c62828'};
  border-left: 5px solid ${props => props.type === 'success' ? '#2e7d32' : '#c62828'};
`;

/* Pipeline Diagram Styles */
/*
.pipeline-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 30px 0;
  font-family: monospace;
  overflow-x: auto;
}
.pipeline-row {
  display: flex;
  align-items: center;
  gap: 5px;
}
.pipeline-label {
  min-width: 100px;
  font-weight: bold;
  color: #444;
}
.pipe-stage {
  width: 60px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  color: white;
  font-size: 0.8em;
  font-weight: bold;
}
.st-fetch { background-color: #ef5350; }
.st-decode { background-color: #42a5f5; }
.st-execute { background-color: #66bb6a; }
.st-mem { background-color: #ffa726; }
.st-write { background-color: #ab47bc; }
.st-empty { background-color: transparent; width: 60px; }
*/

/* Multicore Diagram Styles */
/*
.multicore-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  background: #e3f2fd;
  border: 3px solid #1565c0;
  border-radius: 12px;
  margin: 30px 0;
  position: relative;
}
.core-box {
  width: 120px;
  height: 120px;
  background: #fff;
  border: 2px solid #1976d2;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: #1565c0;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.shared-cache {
  width: 100%;
  height: 50px;
  background: #90caf9;
  border: 2px dashed #0d47a1;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: #0d47a1;
  margin-top: 20px;
}
*/



