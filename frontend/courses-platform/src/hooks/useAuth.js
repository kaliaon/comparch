import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services";

/**
 * Custom hook for handling authentication
 * Provides login, logout, registration and auth state
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status
  const checkAuthStatus = useCallback(() => {
    const username = sessionStorage.getItem("username");
    const isAuth = authService.isAuthenticated();

    setIsAuthenticated(isAuth);
    setUser(isAuth && username ? { username } : null);
    setIsLoading(false);
  }, []);

  // Login
  const login = async (username, password) => {
    setIsLoading(true);

    try {
      const result = await authService.login(username, password);

      if (result.success) {
        checkAuthStatus();
        return { success: true };
      }

      return {
        success: false,
        message: result.message || "Пайдаланушы аты немесе құпия сөз қате",
      };
    } catch (error) {
      return {
        success: false,
        message: "Жүйеге кіру кезінде қате пайда болды",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (username, email, password) => {
    setIsLoading(true);

    try {
      const result = await authService.registerAndLogin(
        username,
        email,
        password
      );

      if (result.success) {
        checkAuthStatus();
        return { success: true };
      }

      return {
        success: false,
        message: result.message || "Тіркелу кезінде қате пайда болды",
      };
    } catch (error) {
      return {
        success: false,
        message: "Тіркелу кезінде қате пайда болды",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    checkAuthStatus,
  };
};

export default useAuth;
