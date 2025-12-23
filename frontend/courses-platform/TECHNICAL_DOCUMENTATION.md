# OquSpace - Technical Documentation

## Architecture Overview

OquSpace is a single-page application (SPA) built with React that communicates with a RESTful backend API. The application follows a component-based architecture with a clear separation of concerns.

## Frontend Architecture

### Core Structure

```
frontend/
├── public/            # Static files
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Application pages/routes
│   ├── services/      # API and business logic
│   ├── hooks/         # Custom React hooks
│   ├── App.js         # Main component with routing
│   └── index.js       # Application entry point
└── package.json       # Dependencies and scripts
```

### State Management

The application uses React's built-in state management solutions:

- **useState**: For local component state
- **useEffect**: For side effects and data fetching
- **useContext** (implicitly): For auth state and theme

### Routing

Routing is handled with React Router v7:

```jsx
<Router>
  <Routes>
    <Route path="/" element={<MainPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/course/:id" element={<CoursePage />} />
    <Route path="/course/:courseId/lesson/:lessonId" element={<LessonPage />} />
    <Route path="/about" element={<AboutPage />} />
  </Routes>
</Router>
```

## API Integration

### Service Layer

API communication is handled through a service layer pattern:

1. **api.js**: Core API functionality with request/response handling
2. **authService.js**: Authentication operations
3. **courseService.js**: Course-related operations
4. **testService.js**: Quiz and test functionality

### API Endpoints

#### Authentication

- `POST /api/auth/register`: User registration
- `POST /api/auth/login`: User login
- `POST /api/auth/refresh`: Refresh access token
- `POST /api/auth/logout`: User logout

#### Courses

- `GET /api/courses`: Get all courses
- `GET /api/courses/{id}`: Get course details
- `GET /api/courses/{courseId}/lessons/{lessonId}`: Get lesson details
- `POST /api/courses/{courseId}/enroll`: Enroll in a course
- `POST /api/courses/{courseId}/progress`: Update course progress

#### User Profile

- `GET /api/users/profile`: Get user profile
- `PUT /api/users/profile`: Update user profile
- `GET /api/users/progress`: Get learning progress

#### Tests and Quizzes

- `GET /api/tests/{id}`: Get test details
- `POST /api/tests/{id}/submit`: Submit test answers
- `GET /api/tests/{id}/results`: Get test results

## Key Components

### Header Component

The Header component provides navigation and user authentication status:

```jsx
<Header />
```

Key features:

- Navigation links
- User authentication status
- Profile menu
- Mobile-responsive design

### Quiz Component

Interactive quiz system for testing knowledge:

```jsx
<Quiz questions={questionsArray} onComplete={handleQuizCompletion} />
```

### AI Chat Button

Provides AI-assisted learning support:

```jsx
<AIChatButton courseId={courseId} lessonId={lessonId} />
```

## Authentication Flow

1. **Login/Registration**:

   - User submits credentials
   - Server validates and returns JWT token
   - Token stored in sessionStorage

2. **Request Authentication**:

   - Auth token attached to API requests
   - Unauthorized responses redirect to login

3. **Token Management**:
   - Token expiration handling
   - Auto-refresh mechanism

## Styling Approach

The application uses Styled Components for CSS-in-JS styling:

```jsx
const Button = styled.button`
  background-color: #3066be;
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #274c91;
  }
`;
```

## Testing Strategy

### Component Tests

- Render testing
- User interaction simulation
- Snapshot testing

### Service Tests

- API mock testing
- Authentication flow testing
- Error handling

## Deployment Process

1. **Build Generation**:

   ```
   npm run build
   ```

2. **Optimization**:

   - JS/CSS minification
   - Asset optimization
   - Code splitting

3. **Deployment Options**:
   - Static hosting (Netlify, Vercel)
   - Docker containerization
   - Traditional web hosting

## Performance Considerations

- Lazy loading for routes
- Image optimization
- Caching strategies
- Bundle size monitoring

## Security Considerations

- JWT token storage in sessionStorage
- XSS protection
- CSRF protection
- Input validation
- Secure API communication

## Localization

The application currently supports Kazakh language and can be extended to support additional languages using a translation system.

## Accessibility

- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Color contrast compliance

## Browser Compatibility

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest version)

## Known Issues and Limitations

- Limited offline support
- No PWA functionality yet
- Backend API must be running locally for development
