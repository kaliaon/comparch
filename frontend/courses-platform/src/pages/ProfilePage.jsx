import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header";
import { authService } from "../services";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    username: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    school: "",
    bio: "",
  });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    school: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        // In a real app, you would fetch user profile from an API
        // For now, we'll use mock data from sessionStorage
        const username = sessionStorage.getItem("username") || "Username";

        // Mock data for demonstration
        const mockUser = {
          username: username,
          fullName: "Студент Қолданушы",
          email: "student@example.com",
          phoneNumber: "+7 (7XX) XXX-XX-XX",
          school: "Алматы қаласы №123 лицейі",
          bio: "Білім алуға құштар студент. Ақпараттық технологиялар және программалау саласына қызығушылық танытамын.",
        };

        setUser(mockUser);
        setFormData({
          ...mockUser,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setIsLoading(false);
      } catch (error) {
        setError("Профиль ақпаратын жүктеу кезінде қате пайда болды");
        setIsLoading(false);
      }
    };

    checkAuthAndLoadProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If canceling edit, reset form data to current user data
      setFormData({
        ...user,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }

    setIsEditing(!isEditing);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      setError("Жаңа құпия сөздер сәйкес келмейді");
      return;
    }

    try {
      setIsLoading(true);

      // In a real app, you would send the updated profile to an API
      // For now, we'll just simulate a successful update
      setTimeout(() => {
        // Update local user data (mock update)
        const updatedUser = {
          ...user,
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          school: formData.school,
          bio: formData.bio,
        };

        setUser(updatedUser);
        setIsEditing(false);
        setSuccess("Профиль сәтті жаңартылды");
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setError("Профильді жаңарту кезінде қате пайда болды");
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Header />
      <MainContent>
        <ProfileContainer>
          <ProfileHeader>
            <h1>Менің профилім</h1>
          </ProfileHeader>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          {isLoading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Жүктелуде...</LoadingText>
            </LoadingContainer>
          ) : (
            <>
              <ProfileGrid>
                <ProfileSidebar>
                  <ProfileImageContainer>
                    <ProfileImage>
                      {user.username.charAt(0).toUpperCase()}
                    </ProfileImage>
                    {!isEditing && (
                      <EditButton onClick={handleEditToggle}>
                        Профильді өңдеу
                      </EditButton>
                    )}
                  </ProfileImageContainer>

                  <StatsContainer>
                    <StatsTitle>Менің статистикам</StatsTitle>
                    <StatItem>
                      <StatLabel>Курстар:</StatLabel>
                      <StatValue>3</StatValue>
                    </StatItem>
                    <StatItem>
                      <StatLabel>Аяқталған сабақтар:</StatLabel>
                      <StatValue>12</StatValue>
                    </StatItem>
                    <StatItem>
                      <StatLabel>Тапсырмалар:</StatLabel>
                      <StatValue>27</StatValue>
                    </StatItem>
                    <StatItem>
                      <StatLabel>Сертификаттар:</StatLabel>
                      <StatValue>1</StatValue>
                    </StatItem>
                  </StatsContainer>
                </ProfileSidebar>

                <ProfileDetails>
                  {isEditing ? (
                    <ProfileForm onSubmit={handleSubmit}>
                      <FormSection>
                        <SectionTitle>Жеке ақпарат</SectionTitle>
                        <FormGrid>
                          <FormGroup>
                            <Label htmlFor="username">Пайдаланушы аты</Label>
                            <Input
                              type="text"
                              id="username"
                              name="username"
                              value={user.username}
                              disabled
                            />
                            <HelpText>
                              Пайдаланушы атын өзгерту мүмкін емес
                            </HelpText>
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="fullName">Толық аты-жөні</Label>
                            <Input
                              type="text"
                              id="fullName"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              required
                            />
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="email">Электрондық пошта</Label>
                            <Input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                            />
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="phoneNumber">Телефон нөмірі</Label>
                            <Input
                              type="tel"
                              id="phoneNumber"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                            />
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="school">Оқу орны</Label>
                            <Input
                              type="text"
                              id="school"
                              name="school"
                              value={formData.school}
                              onChange={handleInputChange}
                            />
                          </FormGroup>
                        </FormGrid>

                        <FormGroup>
                          <Label htmlFor="bio">Өзіңіз туралы</Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            rows="4"
                            value={formData.bio}
                            onChange={handleInputChange}
                          />
                        </FormGroup>
                      </FormSection>

                      <FormSection>
                        <SectionTitle>Құпия сөзді өзгерту</SectionTitle>
                        <FormGrid>
                          <FormGroup>
                            <Label htmlFor="currentPassword">
                              Ағымдағы құпия сөз
                            </Label>
                            <Input
                              type="password"
                              id="currentPassword"
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                            />
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="newPassword">Жаңа құпия сөз</Label>
                            <Input
                              type="password"
                              id="newPassword"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                            />
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="confirmPassword">
                              Жаңа құпия сөзді қайталаңыз
                            </Label>
                            <Input
                              type="password"
                              id="confirmPassword"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                            />
                          </FormGroup>
                        </FormGrid>

                        <HelpText>
                          Құпия сөзді өзгерту үшін барлық үш өрісті толтырыңыз.
                          Құпия сөзді өзгертпеу үшін, өрістерді бос қалдырыңыз.
                        </HelpText>
                      </FormSection>

                      <ButtonGroup>
                        <CancelButton type="button" onClick={handleEditToggle}>
                          Бас тарту
                        </CancelButton>
                        <SaveButton type="submit" disabled={isLoading}>
                          {isLoading ? "Сақталуда..." : "Сақтау"}
                        </SaveButton>
                      </ButtonGroup>
                    </ProfileForm>
                  ) : (
                    <ProfileInfo>
                      <InfoSection>
                        <InfoTitle>Жеке ақпарат</InfoTitle>
                        <InfoGrid>
                          <InfoItem>
                            <InfoLabel>Пайдаланушы аты:</InfoLabel>
                            <InfoValue>{user.username}</InfoValue>
                          </InfoItem>
                          <InfoItem>
                            <InfoLabel>Толық аты-жөні:</InfoLabel>
                            <InfoValue>{user.fullName}</InfoValue>
                          </InfoItem>
                          <InfoItem>
                            <InfoLabel>Электрондық пошта:</InfoLabel>
                            <InfoValue>{user.email}</InfoValue>
                          </InfoItem>
                          <InfoItem>
                            <InfoLabel>Телефон нөмірі:</InfoLabel>
                            <InfoValue>{user.phoneNumber || "-"}</InfoValue>
                          </InfoItem>
                          <InfoItem>
                            <InfoLabel>Оқу орны:</InfoLabel>
                            <InfoValue>{user.school || "-"}</InfoValue>
                          </InfoItem>
                        </InfoGrid>
                      </InfoSection>

                      {user.bio && (
                        <InfoSection>
                          <InfoTitle>Өзі туралы</InfoTitle>
                          <InfoBio>{user.bio}</InfoBio>
                        </InfoSection>
                      )}
                    </ProfileInfo>
                  )}
                </ProfileDetails>
              </ProfileGrid>
            </>
          )}
        </ProfileContainer>
      </MainContent>
    </PageWrapper>
  );
};

export default ProfilePage;

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 40px 20px;
`;

const ProfileContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const ProfileHeader = styled.div`
  padding: 30px;
  border-bottom: 1px solid #f1f5f9;

  h1 {
    font-size: 1.75rem;
    color: #2d3748;
    margin: 0;
  }
`;

const ErrorMessage = styled.div`
  margin: 20px 30px 0;
  padding: 12px 16px;
  background-color: #fef2f2;
  color: #b91c1c;
  border-radius: 6px;
  font-size: 0.9rem;
  border-left: 4px solid #ef4444;
`;

const SuccessMessage = styled.div`
  margin: 20px 30px 0;
  padding: 12px 16px;
  background-color: #f0fdf4;
  color: #166534;
  border-radius: 6px;
  font-size: 0.9rem;
  border-left: 4px solid #22c55e;
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
  font-size: 1rem;
  color: #718096;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileSidebar = styled.aside`
  padding: 30px;
  border-right: 1px solid #f1f5f9;

  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid #f1f5f9;
  }
`;

const ProfileImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(45deg, #3066be, #119da4);
  color: white;
  font-size: 3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const EditButton = styled.button`
  background-color: #3066be;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #254e99;
  }
`;

const StatsContainer = styled.div`
  background-color: #f8fafc;
  border-radius: 10px;
  padding: 20px;
`;

const StatsTitle = styled.h3`
  font-size: 1rem;
  color: #2d3748;
  margin: 0 0 15px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #718096;
`;

const StatValue = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;
`;

const ProfileDetails = styled.div`
  padding: 30px;
`;

const ProfileInfo = styled.div``;

const InfoSection = styled.div`
  margin-bottom: 30px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoTitle = styled.h3`
  font-size: 1.1rem;
  color: #2d3748;
  margin: 0 0 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const InfoItem = styled.div``;

const InfoLabel = styled.div`
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 5px;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: #2d3748;
  font-weight: 500;
`;

const InfoBio = styled.p`
  font-size: 0.95rem;
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
`;

const ProfileForm = styled.form``;

const FormSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  color: #2d3748;
  margin: 0 0 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3066be;
  }

  &:disabled {
    background-color: #f1f5f9;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3066be;
  }
`;

const HelpText = styled.div`
  font-size: 0.8rem;
  color: #718096;
  margin-top: 5px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
`;

const CancelButton = styled(Button)`
  background-color: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;

  &:hover {
    background-color: #e2e8f0;
  }
`;

const SaveButton = styled(Button)`
  background-color: #3066be;
  color: white;
  border: none;

  &:hover {
    background-color: #254e99;
  }

  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
`;
