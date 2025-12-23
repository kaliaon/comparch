import api from "./api";

const COURSE_ENDPOINTS = {
  ALL_COURSES: "/courses/courses/",
  COURSE_DETAIL: (id) => `/courses/courses/${id}/`,
  LESSON_DETAIL: (id) => `/courses/lessons/${id}/`,
  LESSON_TEST: (id) => `/courses/lessons/${id}/test/`,
  COMPLETE_COURSE: (id) => `/courses/courses/${id}/complete/`,
};

/**
 * Fetch all available courses
 * @returns {Promise<Object>} - List of courses
 */
export const getAllCourses = async () => {
  try {
    const response = await api.get(COURSE_ENDPOINTS.ALL_COURSES);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Course fetching error:", error);
    return {
      success: false,
      message: "Курстарды жүктеу кезінде қате пайда болды",
      error,
    };
  }
};

/**
 * Fetch details for a specific course including its lessons
 * @param {string|number} courseId - The ID of the course
 * @returns {Promise<Object>} - Course details with lessons
 */
export const getCourseDetails = async (courseId) => {
  try {
    const response = await api.get(COURSE_ENDPOINTS.COURSE_DETAIL(courseId));
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Course details error:", error);
    return {
      success: false,
      message: "Курс ақпаратын жүктеу кезінде қате пайда болды",
      error,
    };
  }
};

/**
 * Fetch details for a specific lesson
 * @param {string|number} lessonId - The ID of the lesson
 * @returns {Promise<Object>} - Lesson details including any quiz data
 */
export const getLessonDetails = async (lessonId) => {
  try {
    const response = await api.get(COURSE_ENDPOINTS.LESSON_DETAIL(lessonId));
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Lesson details error:", error);
    return {
      success: false,
      message: "Сабақ ақпаратын жүктеу кезінде қате пайда болды",
      error,
    };
  }
};

/**
 * Fetch test data for a specific lesson
 * @param {string|number} lessonId - The ID of the lesson
 * @returns {Promise<Object>} - Test data for the lesson
 */
export const getLessonTest = async (lessonId) => {
  try {
    const response = await api.get(COURSE_ENDPOINTS.LESSON_TEST(lessonId));
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Lesson test error:", error);
    return {
      success: false,
      message: "Тест деректерін жүктеу кезінде қате пайда болды",
      error,
    };
  }
};

/**
 * Complete a course and generate a certificate
 * @param {string|number} courseId - The ID of the course
 * @returns {Promise<Object>} - Certificate data
 */
export const completeCourse = async (courseId) => {
  try {
    const response = await api.post(COURSE_ENDPOINTS.COMPLETE_COURSE(courseId));
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Course completion error:", error);
    return {
      success: false,
      message: "Курсты аяқтау кезінде қате пайда болды",
      error,
    };
  }
};

/**
 * Submit answers for a lesson quiz
 * @param {string|number} lessonId - The ID of the lesson
 * @param {Array} answers - Array of user's answers
 * @returns {Promise<Object>} - Quiz results
 */
export const submitQuizAnswers = async (lessonId, answers) => {
  try {
    const response = await api.post(
      `${COURSE_ENDPOINTS.LESSON_DETAIL(lessonId)}quiz/`,
      { answers }
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Quiz submission error:", error);
    return {
      success: false,
      message: "Тест жауаптарын жіберу кезінде қате пайда болды",
      error,
    };
  }
};

const courseService = {
  getAllCourses,
  getCourseDetails,
  getLessonDetails,
  getLessonTest,
  completeCourse,
  submitQuizAnswers,
};

export default courseService;
