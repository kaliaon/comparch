import React from "react";
import styled from "styled-components";

const Text = ({ title, text, text2, image }) => {
  return (
    <Container>
      <Title>{title}</Title>
      <PlainText>{text}</PlainText>
      <img src={image} height={300} width={300} alt="Course illustration" />
      <PlainText>{text2}</PlainText>
    </Container>
  );
};

export default Text;

const Container = styled.div`
  margin: 20px;
  padding: 20px;
  border-radius: 10px;
  background: #f4f4f4;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #333;
`;

const PlainText = styled.p`
  color: #666;
`;
