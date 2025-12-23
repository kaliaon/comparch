/**
 * Base API configuration and utility functions
 */

// API base URL - ideally this would come from environment variables
const API_BASE_URL = "http://127.0.0.1:8000/api"

/**
 * Custom error for API responses
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Get stored auth token
 */
export const getAuthToken = () => {
  return sessionStorage.getItem("accessToken");
};

/**
 * Default request headers
 */
const getHeaders = (includeAuth = true) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Generic API request function
 */
export const apiRequest = async (endpoint, options = {}) => {
  const {
    method = "GET",
    data = null,
    requireAuth = true,
    customHeaders = {},
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  console.log(`Making ${method} request to: ${url}`);

  const requestOptions = {
    method,
    headers: {
      ...getHeaders(requireAuth),
      ...customHeaders,
    },
  };

  if (data) {
    requestOptions.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, requestOptions);

    console.log(`Response status: ${response.status}`);

    // For non-204 responses, try to parse JSON
    let responseData = null;
    if (response.status !== 204) {
      try {
        responseData = await response.json();
      } catch (error) {
        console.error("Error parsing response JSON:", error);
        // If it's not JSON, that's fine in some cases
        if (response.ok) {
          return { success: true };
        }
      }
    }

    if (!response.ok) {
      console.error("API error response:", responseData);
      const errorMessage =
        responseData?.detail || "An error occurred during the request";
      throw new ApiError(errorMessage, response.status, responseData);
    }

    return responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network errors or other fetch problems
    console.error("Network error:", error);
    throw new ApiError(error.message || "Network error", 0, {
      originalError: error,
    });
  }
};

/**
 * API utility methods for common HTTP methods
 */
export const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: "GET" }),

  post: (endpoint, data, options = {}) =>
    apiRequest(endpoint, { ...options, method: "POST", data }),

  put: (endpoint, data, options = {}) =>
    apiRequest(endpoint, { ...options, method: "PUT", data }),

  patch: (endpoint, data, options = {}) =>
    apiRequest(endpoint, { ...options, method: "PATCH", data }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
};

export default api;
