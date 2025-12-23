# OquSpace - Online Learning Platform

## Overview

OquSpace is a modern online learning platform built with React that provides educational courses in Kazakh language. The platform offers an intuitive interface for users to browse courses, access lessons, take quizzes, and track their learning progress.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Features

- **User Authentication**: Secure registration and login functionality
- **Course Catalog**: Browse and search through available courses
- **Lesson Viewer**: Access course lessons with various content formats
- **Quiz System**: Interactive quizzes to test knowledge
- **Profile Management**: View and update user profile and progress
- **AI Chat Assistant**: Get help and guidance while learning
- **Test Taking**: Take tests and view results
- **Responsive Design**: Access from any device (desktop, tablet, mobile)

## Technology Stack

- **Frontend**: React (v19.0.0)
- **Routing**: React Router (v7.0.2)
- **Styling**: Styled Components (v6.1.13)
- **State Management**: React hooks for local state
- **API Integration**: Custom fetch-based service layer
- **Testing**: React Testing Library

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:

```
npm install
```

### Running the Application

1. Start the development server:

```
npm start
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/             # Application pages/routes
├── services/          # API integration and services
├── hooks/             # Custom React hooks
├── assets/            # Static assets like images
├── App.js             # Main application component and routing
└── index.js           # Application entry point
```

## Key Components

### Pages

- **MainPage**: Home page displaying course catalog and featured content
- **LoginPage/RegisterPage**: User authentication
- **ProfilePage**: User profile management
- **CoursePage**: Details about a specific course
- **LessonPage**: View lesson content
- **AboutPage**: Information about the platform

### Components

- **Header**: Navigation and user menu
- **Quiz**: Interactive quiz component
- **TestTaker/TestEditor/TestResults**: Test-related components
- **AIChatButton**: AI assistant for learning support

## API Integration

The application communicates with a backend API (running at http://127.0.0.1:8000/api by default) through a dedicated service layer. The main services include:

- **authService**: Handles user authentication
- **courseService**: Manages course-related operations
- **testService**: Handles quiz and test functionality

## Authentication

Authentication is implemented using JWT tokens stored in session storage. The auth flow includes:

- Login/registration
- Token management
- Protected routes

## Testing

Run tests with:

```
npm test
```

## Deployment

Build the production-ready application:

```
npm run build
```

The build artifacts will be stored in the `build/` folder, ready to be deployed to any static hosting service.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request
