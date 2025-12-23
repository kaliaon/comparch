import api from "./api";

const TEST_ENDPOINTS = {
  // Test Management
  GET_LESSON_TEST: (lessonId) => `/lessons/${lessonId}/test/`,
  CREATE_LESSON_TEST: (lessonId) => `/lessons/${lessonId}/create-test/`,
  TEST_DETAIL: (testId) => `/tests/${testId}/`,
  ALL_TESTS: "/tests/",

  // Test Taking Flow
  START_TEST: (testId) => `/tests/${testId}/start/`,
  SUBMIT_TEST: (submissionId) => `/test-submissions/${submissionId}/submit/`,
  TEST_RESULT: (submissionId) => `/test-submissions/${submissionId}/result/`,

  // Review and Grading
  REVIEW_ANSWER: (answerId) => `/answers/${answerId}/review/`,
};

/**
 * Get test for a specific lesson
 * @param {string|number} lessonId - The ID of the lesson
 * @returns {Promise<Object>} - Test details including questions and choices
 */
export const getLessonTest = async (lessonId) => {
  try {
    const response = await api.get(TEST_ENDPOINTS.GET_LESSON_TEST(lessonId));
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      message: "Тест ақпаратын жүктеу кезінде қате пайда болды",
      error,
    };
  }
};

/**
 * Create a new test for a lesson
 * @param {string|number} lessonId - The ID of the lesson
 * @param {Object} testData - Test data including title, description, questions, etc.
 * @returns {Promise<Object>} - Created test details
 */
export const createLessonTest = async (lessonId, testData) => {
  try {
    const response = await api.post(
      TEST_ENDPOINTS.CREATE_LESSON_TEST(lessonId),
      testData
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      message: "Тест құру кезінде қате пайда болды",
      error,
    };
  }
};

/**
 * Get details for a specific test
 * @param {string|number} testId - The ID of the test
 * @returns {Promise<Object>} - Test details
 */
export const getTestDetails = async (testId) => {
  try {
    const response = await api.get(TEST_ENDPOINTS.TEST_DETAIL(testId));
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      message: "Тест ақпаратын жүктеу кезінде қате пайда болды",
      error,
    };
  }
};

/**
 * Update an existing test
 * @param {string|number} testId - The ID of the test
 * @param {Object} testData - Updated test data
 * @returns {Promise<Object>} - Updated test details
 */
export const updateTest = async (testId, testData) => {
  try {
    const response = await api.put(
      TEST_ENDPOINTS.TEST_DETAIL(testId),
      testData
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      message: "Тестті жаңарту кезінде қате пайда болды",
      error,
    };
  }
};

/**
 * Delete a test
 * @param {string|number} testId - The ID of the test
 * @returns {Promise<Object>} - Success status
 */
export const deleteTest = async (testId) => {
  try {
    await api.delete(TEST_ENDPOINTS.TEST_DETAIL(testId));
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: "Тестті жою кезінде қате пайда болды",
      error,
    };
  }
};

/**
 * Start a test (creates a test submission)
 * @param {string|number} testId - The ID of the test
 * @returns {Promise<Object>} - Test submission details
 */
export const startTest = async (testId) => {
  try {
    const response = await api.post(TEST_ENDPOINTS.START_TEST(testId));
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      message: "Тестті бастау кезінде қате пайда болды",
      error,
    };
  }
};

/**
 * Submit answers for a test
 * @param {string|number} submissionId - The ID of the test submission
 * @param {Array} answers - Array of answer objects
 * @returns {Promise<Object>} - Submission results
 */
export const submitTestAnswers = async (submissionId, answers) => {
  try {
    const response = await api.post(TEST_ENDPOINTS.SUBMIT_TEST(submissionId), {
      answers,
    });
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      message: "Тест жауаптарын жіберу кезінде қате пайда болды",
      error,
    };
  }
};

/**
 * Get test submission results
 * @param {string|number} submissionId - The ID of the test submission
 * @returns {Promise<Object>} - Detailed test results
 */
export const getTestResults = async (submissionId) => {
  try {
    const response = await api.get(TEST_ENDPOINTS.TEST_RESULT(submissionId));
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      message: "Тест нәтижелерін жүктеу кезінде қате пайда болды",
      error,
    };
  }
};

/**
 * Review and grade an open-ended answer
 * @param {string|number} answerId - The ID of the answer
 * @param {Object} reviewData - Review data including score and feedback
 * @returns {Promise<Object>} - Updated answer details
 */
export const reviewAnswer = async (answerId, reviewData) => {
  try {
    const response = await api.post(
      TEST_ENDPOINTS.REVIEW_ANSWER(answerId),
      reviewData
    );
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      message: "Жауапты бағалау кезінде қате пайда болды",
      error,
    };
  }
};

const testService = {
  getLessonTest,
  createLessonTest,
  getTestDetails,
  updateTest,
  deleteTest,
  startTest,
  submitTestAnswers,
  getTestResults,
  reviewAnswer,
};

export default testService;
