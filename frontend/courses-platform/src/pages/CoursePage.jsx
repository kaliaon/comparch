import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import { courseService } from "../services";
import useAuth from "../hooks/useAuth";
import { AIChatButton } from "../components/index";

const CoursePage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const { user } = useAuth();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [completingCourse, setCompletingCourse] = useState(false);
  const [isCertificateModalOpen, setCertificateModalOpen] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [requirementsError, setRequirementsError] = useState(null);

  const lessons = data.lessons || [];
  const title = data.name || "";

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      const result = await courseService.getCourseDetails(id);

      if (!result.success) {
        throw new Error(
          result.message || "An error occurred while fetching course data"
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
  }, [id, navigate]);

  useEffect(() => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/login");
      return;
    }

    fetchCourse().then((fetchedData) => {
      if (fetchedData) {
        setData(fetchedData);
        // For now, we'll check if all lessons are completed based on some property
        // Since there's no API yet, we'll assume the course is not yet completed
        const isCompleted = fetchedData.is_completed || false;
        setCourseCompleted(isCompleted);
      }
    });
  }, [navigate, fetchCourse]);

  // Check if course requirements are met
  const checkCourseRequirements = () => {
    // This is a mock implementation - in a real app, you would check
    // if the user completed all lessons, passed all required tests, etc.

    // Let's simulate some checks:

    // 1. Check if course has lessons
    if (lessons.length === 0) {
      return {
        passed: false,
        message: "Курсты аяқтау үшін сабақтар қажет",
      };
    }

    // 2. Check if user watched all lessons (mock check)
    // For demo, let's randomly determine if user has watched all lessons
    const hasWatchedAllLessons = Math.random() > 0.5; // 50% chance of success

    if (!hasWatchedAllLessons) {
      return {
        passed: false,
        message: "Барлық сабақтарды көру керек",
      };
    }

    // 3. Check if user passed all required tests (mock check)
    const hasPassedAllTests = Math.random() > 0.2; // 80% chance of success

    if (!hasPassedAllTests) {
      return {
        passed: false,
        message: "Барлық тесттерден өту керек",
      };
    }

    // If all checks pass
    return {
      passed: true,
      message: "Барлық талаптар орындалды",
    };
  };

  // Handle completing the course
  const handleCompleteCourse = async () => {
    try {
      // First check if requirements are met
      const requirements = checkCourseRequirements();
      if (!requirements.passed) {
        setRequirementsError(requirements.message);
        return;
      }

      setRequirementsError(null);
      setCompletingCourse(true);

      // Mock delay to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get user's name from auth context
      let studentName = "Студент";
      if (user) {
        // Priority: full_name or username if available
        studentName = user.full_name || user.username || "Студент";
      }

      // Generate mock certificate data
      const mockCertificate = {
        id: Date.now(),
        title: `${title} курсының сертификаты`,
        course_name: title,
        issued_date: new Date().toISOString(),
        student_name: studentName,
        image_url: "/certificate-placeholder.png",
        pdf_url: "#", // Mock URL - would be a real URL in production
      };

      setCourseCompleted(true);
      setCertificate(mockCertificate);
      setCertificateModalOpen(true);
    } catch (error) {
      console.error("Error generating certificate:", error);
      setError("Сертификатты жасау кезінде қате орын алды");
    } finally {
      setCompletingCourse(false);
    }
  };

  // Close certificate modal
  const closeCertificateModal = () => {
    setCertificateModalOpen(false);
  };

  // Download certificate as PDF
  const downloadCertificate = () => {
    if (certificate && certificate.pdf_url) {
      window.open(certificate.pdf_url, "_blank");
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingText>Курс деректері жүктелуде...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorText>{error}</ErrorText>
        <ErrorButton onClick={() => window.location.reload()}>
          Қайта көру
        </ErrorButton>
      </ErrorContainer>
    );
  }

  return (
    <>
      <Header />
      <Container>
        <BackButton onClick={() => navigate("/")}>
          <BackIcon>←</BackIcon> Курстарға оралу
        </BackButton>

        <CourseHeader>
          <CourseTitle>{title}</CourseTitle>
          <CourseDescription>
            {data.description || "Сипаттама қолжетімді емес"}
          </CourseDescription>
        </CourseHeader>

        <LessonsSection>
          <SectionTitle>Курс сабақтары</SectionTitle>
          <LessonList>
            {lessons.length > 0 ? (
              lessons.map((lesson, index) => (
                <LessonItem key={lesson.id}>
                  <Link to={`lesson/${lesson.id}`}>
                    <LessonNumber>{index + 1}</LessonNumber>
                    <LessonContent>
                      <LessonTitle>{lesson.title}</LessonTitle>
                    </LessonContent>
                    <LessonArrow>→</LessonArrow>
                  </Link>
                </LessonItem>
              ))
            ) : (
              <NoLessons>Бұл курс үшін сабақтар әлі қолжетімді емес.</NoLessons>
            )}
          </LessonList>
        </LessonsSection>

        {/* Certificate Modal */}
        {isCertificateModalOpen && (certificate || courseCompleted) && (
          <ModalOverlay onClick={closeCertificateModal}>
            <CertificateModal onClick={(e) => e.stopPropagation()}>
              <ModalCloseButton onClick={closeCertificateModal}>
                ×
              </ModalCloseButton>
              <ModalTitle>Құттықтаймыз!</ModalTitle>
              <CertificateContainer>
                <Certificate>
                  <CertificateInner>
                    <CertificateHeader>
                      <CertificateLogo>
                        <LogoText>Courses Platform</LogoText>
                      </CertificateLogo>
                      <CertificateHeaderTitle>
                        Certificate of Completion
                      </CertificateHeaderTitle>
                    </CertificateHeader>

                    <CertificateBody>
                      <CertificatePresentation>
                        This is to certify that
                      </CertificatePresentation>
                      <CertificateStudentName>
                        {certificate?.student_name ||
                          (user
                            ? user.full_name || user.username
                            : "Student Name")}
                      </CertificateStudentName>
                      <CertificateAccomplishment>
                        has successfully completed the course
                      </CertificateAccomplishment>
                      <CertificateCourseName>{title}</CertificateCourseName>
                      <CertificateDate>
                        On{" "}
                        {new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CertificateDate>
                    </CertificateBody>

                    <CertificateFooter>
                      <CertificateSignature>
                        <SignatureLine />
                        <SignatureName>Course Instructor</SignatureName>
                      </CertificateSignature>
                      <CertificateSeal>
                        <SealInner>
                          <SealText>VERIFIED</SealText>
                        </SealInner>
                      </CertificateSeal>
                    </CertificateFooter>

                    <CertificateWatermark />
                  </CertificateInner>
                </Certificate>
                <CertificateControls>
                  <CertificateDownload onClick={downloadCertificate}>
                    Сертификатты жүктеу
                  </CertificateDownload>
                </CertificateControls>
              </CertificateContainer>
            </CertificateModal>
          </ModalOverlay>
        )}
      </Container >
      <AIChatButton courseId={id} courseName={title} />
    </>
  );
};

export default CoursePage;

// Styled Components
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

const CourseHeader = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 40px;
`;

const CourseTitle = styled.h1`
  font-size: 2.5rem;
  color: #3066be;
  margin-bottom: 10px;
`;

const CourseDescription = styled.p`
  color: #666;
  font-size: 1.1rem;
  max-width: 800px;
  margin: 0 auto;
`;

const LessonsSection = styled.div`
  width: 100%;
  max-width: 900px;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 20px;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 50px;
    height: 3px;
    background-color: #119da4;
  }
`;

const LessonList = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
`;

const LessonItem = styled.li`
  background: white;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  a {
    display: flex;
    align-items: center;
    padding: 20px;
    color: inherit;
    text-decoration: none;
  }
`;

const LessonNumber = styled.div`
  background: #3066be;
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  margin-right: 15px;
`;

const LessonContent = styled.div`
  flex: 1;
`;

const LessonTitle = styled.h3`
  margin: 0 0 5px 0;
  color: #333;
  font-size: 1.2rem;
`;

const LessonDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const LessonArrow = styled.span`
  color: #3066be;
  font-size: 1.5rem;
  opacity: 0.7;
  transition: opacity 0.2s, transform 0.2s;

  ${LessonItem}:hover & {
    opacity: 1;
    transform: translateX(5px);
  }
`;

const NoLessons = styled.div`
  padding: 30px;
  text-align: center;
  background: white;
  border-radius: 8px;
  color: #666;
`;

const CourseCompletionSection = styled.div`
  width: 100%;
  max-width: 900px;
  margin-top: 50px;
  padding: 30px;
  background-color: white;
  border-radius: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const CompletionStatus = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CompletedBadge = styled.div`
  display: flex;
  align-items: center;
  background-color: #e6f7ee;
  color: #27ae60;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 16px;
`;

const CompletedIcon = styled.span`
  margin-right: 8px;
  font-size: 18px;
  font-weight: bold;
`;

const ProgressIndicator = styled.div`
  color: #666;
  font-size: 16px;
`;

const CompleteCourseButton = styled.button`
  padding: 14px 30px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 6px rgba(39, 174, 96, 0.2);

  &:hover {
    background-color: #219653;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: #a0d8b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ViewCertificateButton = styled.button`
  padding: 14px 30px;
  background-color: #3066be;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 6px rgba(48, 102, 190, 0.2);

  &:hover {
    background-color: #254d95;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(48, 102, 190, 0.3);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
`;

const CertificateModal = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  padding: 30px;
  position: relative;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #333;
  }
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  text-align: center;
  color: #27ae60;
  margin-bottom: 20px;
`;

// New Certificate Styled Components
const CertificateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const Certificate = styled.div`
  width: 100%;
  max-width: 800px;
  aspect-ratio: 1.414 / 1; /* A4 paper ratio */
  background: white;
  border-radius: 5px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 10px;
  margin-bottom: 20px;
`;

const CertificateInner = styled.div`
  width: 100%;
  height: 100%;
  border: 2px solid #c3a839;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #fffef8;
  padding: 20px;
`;

const CertificateHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
`;

const CertificateLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
`;

const LogoText = styled.h3`
  font-family: "Georgia", serif;
  font-size: 24px;
  color: #3066be;
  letter-spacing: 1px;
`;

const CertificateHeaderTitle = styled.h1`
  font-family: "Georgia", serif;
  font-size: 36px;
  font-weight: 700;
  color: #333;
  margin: 0;
  text-align: center;
  letter-spacing: 2px;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 2px;
    background: #c3a839;
  }
`;

const CertificateBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 20px 0;
  text-align: center;
`;

const CertificatePresentation = styled.p`
  font-size: 16px;
  color: #555;
  margin-bottom: 5px;
`;

const CertificateStudentName = styled.h2`
  font-family: "Brush Script MT", cursive;
  font-size: 48px;
  color: #3066be;
  margin: 15px 0;
  letter-spacing: 1px;
`;

const CertificateAccomplishment = styled.p`
  font-size: 16px;
  color: #555;
  margin: 5px 0;
`;

const CertificateCourseName = styled.h3`
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 10px 0 20px;
  padding: 0 20px;
  text-align: center;
`;

const CertificateDate = styled.p`
  font-size: 16px;
  color: #555;
  margin-top: 15px;
`;

const CertificateFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  padding: 0 40px;
  margin-top: auto;
`;

const CertificateSignature = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
`;

const SignatureLine = styled.div`
  width: 200px;
  height: 1px;
  background: #333;
  margin-bottom: 5px;
`;

const SignatureName = styled.p`
  font-size: 14px;
  color: #555;
`;

const CertificateSeal = styled.div`
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SealInner = styled.div`
  width: 100%;
  height: 100%;
  border: 2px solid #c3a839;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-15deg);
`;

const SealText = styled.span`
  color: #c3a839;
  font-weight: bold;
  font-size: 14px;
  letter-spacing: 1px;
`;

const CertificateWatermark = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  width: 300px;
  height: 300px;
  background-image: radial-gradient(
    circle,
    rgba(198, 168, 57, 0.1) 0%,
    rgba(198, 168, 57, 0) 70%
  );
  z-index: 0;
  pointer-events: none;
`;

const CertificateControls = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const CertificateDownload = styled.button`
  padding: 12px 25px;
  background-color: #3066be;
  color: white;
  border: none;
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f9f9f9;
`;

const LoadingText = styled.p`
  font-size: 18px;
  color: #333;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f9f9f9;
`;

const ErrorText = styled.p`
  font-size: 18px;
  color: #ff3333;
  margin-bottom: 20px;
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

const RequirementsError = styled.div`
  display: flex;
  align-items: center;
  background-color: #ffefef;
  color: #e74c3c;
  padding: 10px 20px;
  border-radius: 5px;
  margin-bottom: 20px;
  font-size: 14px;
  width: 100%;
  max-width: 500px;
  justify-content: center;
`;

const ErrorIcon = styled.span`
  margin-right: 8px;
  font-size: 16px;
  font-weight: bold;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #e74c3c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;
