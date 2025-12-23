import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { authService } from "../services";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Құпия сөздер сәйкес келмейді");
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.registerAndLogin(
        formData.username,
        formData.email,
        formData.password
      );

      if (result.success) {
        navigate("/");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Тіркелу кезінде қате пайда болды");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <FormSection>
          <LogoContainer>
            <LogoText>
              Comp<SpaceText>Arch</SpaceText>
            </LogoText>
            <LogoSubtext>Білім әлеміне қош келдіңіз</LogoSubtext>
          </LogoContainer>

          <Title>Тіркелу</Title>
          <Subtitle>CompArch платформасына қош келдіңіз</Subtitle>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label>Пайдаланушы аты</Label>
              <Input
                type="text"
                placeholder="Пайдаланушы атыңызды енгізіңіз"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>Электрондық пошта</Label>
              <Input
                type="email"
                placeholder="Эл. поштаңызды енгізіңіз"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>Құпия сөз</Label>
              <Input
                type="password"
                placeholder="Құпия сөзіңізді енгізіңіз"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>Құпия сөзді растау</Label>
              <Input
                type="password"
                placeholder="Құпия сөзіңізді қайталап енгізіңіз"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </InputGroup>

            <TermsAgree>
              <Checkbox
                type="checkbox"
                id="terms"
                disabled={isLoading}
                required
              />
              <CheckboxLabel htmlFor="terms">
                Мен{" "}
                <StyledLink as="a" href="#">
                  қолдану шарттарымен
                </StyledLink>{" "}
                және{" "}
                <StyledLink as="a" href="#">
                  құпиялылық саясатымен
                </StyledLink>{" "}
                келісемін
              </CheckboxLabel>
            </TermsAgree>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Жүктелуде..." : "Тіркелу"}
            </Button>
          </Form>

          <Footer>
            Тіркелгіңіз бар ма? <StyledLink to="/login">Кіру</StyledLink>
          </Footer>
        </FormSection>

        <IllustrationSection>
          <Illustration
            src="https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-135.jpg?w=826&t=st=1687458901~exp=1687459501~hmac=40ede1c8ba9c77c6668bd21cc224ab0f437caf47b9d08b618d8bd465bdce0078"
            alt="Register illustration"
          />
        </IllustrationSection>
      </ContentWrapper>
    </PageContainer>
  );
};

export default RegisterPage;

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
`;

const ContentWrapper = styled.div`
  display: flex;
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1000px;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const FormSection = styled.div`
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const LogoText = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: #3066be;
  margin: 0;
`;

const SpaceText = styled.span`
  color: #119da4;
`;

const LogoSubtext = styled.p`
  font-size: 1rem;
  color: #5d6970;
  margin: 0;
`;

const Title = styled.h2`
  font-size: 1.75rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #718096;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3066be;
    box-shadow: 0 0 0 3px rgba(48, 102, 190, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const TermsAgree = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  accent-color: #3066be;
  margin-top: 0.2rem;
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: #4a5568;
  line-height: 1.4;
`;

const Button = styled.button`
  background: #3066be;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;

  &:hover {
    background: #1d4996;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(48, 102, 190, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Footer = styled.p`
  text-align: center;
  margin-top: 2rem;
  color: #718096;
  font-size: 0.875rem;
`;

const StyledLink = styled(Link)`
  color: #3066be;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const IllustrationSection = styled.div`
  flex: 1;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Illustration = styled.img`
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  background-color: #fff5f5;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 4px solid #e53e3e;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;
