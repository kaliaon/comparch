import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import { courseService, authService } from "../services";

const MainPage = () => {
  const navigate = useNavigate();
  const [featuredCourse, setFeaturedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeaturedCourse = async () => {
      // Check authentication first
      if (!authService.isAuthenticated()) {
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        const result = await courseService.getAllCourses();

        if (result.success) {
          // Find the "Компьютер архитектурасы" course
          const compArchCourse = result.data.find(c => c.name === "Компьютер архитектурасы");

          if (compArchCourse) {
            setFeaturedCourse({
              ...compArchCourse,
              lessons_count: compArchCourse.lessons?.length || 0,
            });
          } else {
            // Fallback to the first course if not found
            if (result.data.length > 0) {
              setFeaturedCourse({
                ...result.data[0],
                lessons_count: result.data[0].lessons?.length || 0,
              });
            }
          }
        } else {
          console.error("Failed to fetch courses:", result.message);
          setError(result.message);
        }
      } catch (error) {
        console.error("Error in loadFeaturedCourse:", error);
        setError("Курсты жүктеу кезінде қате пайда болды");
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedCourse();
  }, [navigate]);

  return (
    <PageWrapper>
      <Header />

      {isLoading ? (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Жүктелуде...</LoadingText>
        </LoadingContainer>
      ) : featuredCourse ? (
        <HeroSection>
          <HeroOverlay />
          <HeroContent>
            <BrandTitle>
              Comp<BrandAccent>Arch</BrandAccent>
            </BrandTitle>
            <HeroTitle>{featuredCourse.name}</HeroTitle>
            <HeroSubtitle>
              Компьютердің қалай жұмыс істейтінін, оның құрылымын және негізгі компоненттерін үйреніңіз.
            </HeroSubtitle>

            <HeroCourseMeta>
              <MetaItem>
                <MetaIcon>📚</MetaIcon> {featuredCourse.lessons_count} Сабақ
              </MetaItem>
              <MetaItem>
                <MetaIcon>⚡</MetaIcon> Толық курс
              </MetaItem>
            </HeroCourseMeta>

            <StartButton to={`course/${featuredCourse.id}`}>
              Қазір бастау
            </StartButton>
          </HeroContent>
        </HeroSection>
      ) : (
        <HeroSection>
          <HeroContent>
            <HeroTitle>CompArch-қа қош келдіңіз</HeroTitle>
            <HeroSubtitle>Қазіргі уақытта қолжетімді курстар жоқ.</HeroSubtitle>
          </HeroContent>
        </HeroSection>
      )}

      <FeaturesSection>
        <SectionTitle>Неліктен компьютер архитектурасын үйрену керек?</SectionTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>💻</FeatureIcon>
            <FeatureTitle>Аппараттық құралдарды түсіну</FeatureTitle>
            <FeatureDescription>
              Бағдарламалық құралдардың аппараттық құралдармен төменгі деңгейде қалай әрекеттесетінін түсініңіз.
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>⚙️</FeatureIcon>
            <FeatureTitle>Өнімділікті оңтайландыру</FeatureTitle>
            <FeatureDescription>
              Процессордың орындалуын түсіну арқылы тиімдірек код жазыңыз.
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>🔧</FeatureIcon>
            <FeatureTitle>Жүйелік дизайн</FeatureTitle>
            <FeatureDescription>
              Заманауи есептеуіш жүйелердің құрылымдық блоктарын үйреніңіз.
            </FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>🚀</FeatureIcon>
            <FeatureTitle>Болашақ технологиялар</FeatureTitle>
            <FeatureDescription>
              Бұлтты, шеткі және кванттық есептеулерді түсінуге негіз.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      <Footer>
        <FooterContent>
          <FooterBrand>
            Comp<BrandAccent>Arch</BrandAccent>
          </FooterBrand>
          <FooterLinks>
            {/* Footer links removed as requested */}
          </FooterLinks>
          <FooterCopyright>
            © {new Date().getFullYear()} CompArch. Барлық құқықтар қорғалған.
          </FooterCopyright>
        </FooterContent>
      </Footer>
    </PageWrapper>
  );
};

export default MainPage;

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 100px 20px;
  color: white;
  text-align: center;
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const HeroOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('https://w7.pngwing.com/pngs/351/3/png-transparent-printed-circuit-board-microcontroller-electronics-computer-icons-printed-circuit-board-angle-text-rectangle.png') no-repeat center center;
    background-size: cover;
    opacity: 0.1;
    pointer-events: none;
`;

const HeroContent = styled.div`
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BrandTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 20px;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.8;
`;

const BrandAccent = styled.span`
  color: #119da4;
`;

const HeroTitle = styled.h2`
  font-size: 4rem;
  font-weight: 800;
  margin: 0 0 20px;
  line-height: 1.1;
  background: -webkit-linear-gradient(#fff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media(max-width: 768px) {
      font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 40px;
  opacity: 0.9;
  max-width: 700px;
  line-height: 1.5;
`;

const HeroCourseMeta = styled.div`
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-bottom: 40px;
`;

const StartButton = styled(Link)`
  background-color: #119da4;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 18px 45px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  text-decoration: none;
  display: inline-block;

  &:hover {
    background-color: #0e8a91;
    transform: translateY(-5px);
    box-shadow: 0 15px 25px rgba(0,0,0,0.3);
  }
`;

const MainContent = styled.main`
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  text-align: center;
  margin: 0 0 10px;
`;

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: #718096;
  text-align: center;
  margin: 0 0 40px;
`;

const CoursesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
`;

const CourseCard = styled(Link)`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const CourseCardImage = styled.div`
  height: 180px;
  position: relative;
  overflow: hidden;
`;

const CourseCardImagePlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #3066be, #119da4);
`;

const CourseCardContent = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CourseCardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 10px;
`;

const CourseCardDescription = styled.p`
  font-size: 0.9rem;
  color: #718096;
  margin: 0 0 15px;
  flex: 1;
`;

const CourseCardMeta = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #718096;
  margin-right: 15px;
`;

const MetaIcon = styled.span`
  margin-right: 5px;
`;

const CourseCardButton = styled.span`
  background-color: #3066be;
  color: white;
  padding: 10px 0;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
  font-size: 0.9rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #254e99;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3066be;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 1.1rem;
  color: #718096;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  background-color: #fff5f5;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #e53e3e;
  margin-bottom: 30px;
  font-size: 0.95rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  grid-column: 1 / -1;
`;

const EmptyStateIcon = styled.div`
  font-size: 60px;
  margin-bottom: 20px;
`;

const EmptyStateText = styled.h3`
  font-size: 1.25rem;
  color: #2d3748;
  margin: 0 0 10px;
`;

const EmptyStateSubtext = styled.p`
  font-size: 1rem;
  color: #718096;
`;

const FeaturesSection = styled.section`
  padding: 80px 20px;
  background-color: #f1f5f9;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 40px auto 0;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 36px;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 15px;
`;

const FeatureDescription = styled.p`
  font-size: 0.95rem;
  color: #718096;
  margin: 0;
`;

const Footer = styled.footer`
  background-color: #2d3748;
  color: white;
  padding: 60px 20px 30px;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FooterBrand = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 30px;
`;

const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 30px;
`;

const FooterLink = styled(Link)`
  color: white;
  text-decoration: none;
  margin: 0 15px 10px;
  font-size: 0.95rem;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const FooterCopyright = styled.div`
  font-size: 0.85rem;
  opacity: 0.6;
`;
