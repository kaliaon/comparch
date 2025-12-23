import api, { ApiError } from "./api";

const AUTH_ENDPOINTS = {
  LOGIN: "/users/login/",
  REGISTER: "/users/register/",
  REFRESH_TOKEN: "/users/token/refresh/",
};

/**
 * Store authentication tokens in session storage
 */
export const setAuthTokens = (accessToken, refreshToken, username) => {
  sessionStorage.setItem("accessToken", accessToken);
  sessionStorage.setItem("refreshToken", refreshToken);
  sessionStorage.setItem("username", username);
};

/**
 * Clear authentication tokens from session storage
 */
export const clearAuthTokens = () => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("username");
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!sessionStorage.getItem("accessToken");
};

/**
 * Login user
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} - User data and tokens
 */
export const login = async (username, password) => {
  try {
    const response = await api.post(
      AUTH_ENDPOINTS.LOGIN,
      { username, password },
      { requireAuth: false }
    );

    if (response.access && response.refresh) {
      setAuthTokens(response.access, response.refresh, username);
      return {
        success: true,
        data: response,
        message: "Сәтті кіру",
      };
    }

    throw new ApiError("Invalid response format", 500);
  } catch (error) {
    return {
      success: false,
      message: "Пайдаланушы аты немесе құпия сөз қате",
      error,
    };
  }
};

/**
 * Register a new user
 * @param {string} username - Desired username
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - Registration result
 */
export const register = async (username, email, password) => {
  try {
    const response = await api.post(
      AUTH_ENDPOINTS.REGISTER,
      {
        username,
        email,
        password,
      },
      { requireAuth: false }
    );

    return {
      success: true,
      data: response,
      message: "Тіркелу сәтті болды",
    };
  } catch (error) {
    return {
      success: false,
      message: "Тіркелу кезінде қате пайда болды",
      error,
    };
  }
};

/**
 * Refresh the access token using the refresh token
 * @returns {Promise<Object>} - New tokens
 */
export const refreshToken = async () => {
  const refreshToken = sessionStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new ApiError("No refresh token available", 401);
  }

  try {
    const response = await api.post(
      AUTH_ENDPOINTS.REFRESH_TOKEN,
      {
        refresh: refreshToken,
      },
      { requireAuth: false }
    );

    if (response.access) {
      sessionStorage.setItem("accessToken", response.access);
      return {
        success: true,
        data: response,
      };
    }

    throw new ApiError("Invalid response format", 500);
  } catch (error) {
    clearAuthTokens();
    throw error;
  }
};

/**
 * Logout the user
 */
export const logout = () => {
  clearAuthTokens();
  return { success: true };
};

/**
 * Register and automatically login
 */
export const registerAndLogin = async (username, email, password) => {
  const registerResult = await register(username, email, password);

  if (!registerResult.success) {
    return registerResult;
  }

  return await login(username, password);
};

const authService = {
  login,
  register,
  logout,
  refreshToken,
  isAuthenticated,
  registerAndLogin,
};

export default authService;
