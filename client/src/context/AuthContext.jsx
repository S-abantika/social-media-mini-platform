import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('connectly_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('connectly_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('connectly_token');
    localStorage.removeItem('connectly_user');
    setToken(null);
    setUser(null);
  }, []);

  // Fetch current user details on app load if token exists
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('connectly_token');
      if (savedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('connectly_user', JSON.stringify(res.data.user));
          } else {
            logout();
          }
        } catch (error) {
          console.warn('[AuthContext] Session expired or invalid token:', error.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen to unauthorized event dispatched by Axios interceptor
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async (identifier, password) => {
    const res = await authService.login({ identifier, password });
    if (res.success && res.data) {
      const { user: loggedInUser, token: authToken } = res.data;
      localStorage.setItem('connectly_token', authToken);
      localStorage.setItem('connectly_user', JSON.stringify(loggedInUser));
      setToken(authToken);
      setUser(loggedInUser);
      return res;
    }
    throw new Error(res.message || 'Login failed.');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data) {
      const { user: registeredUser, token: authToken } = res.data;
      localStorage.setItem('connectly_token', authToken);
      localStorage.setItem('connectly_user', JSON.stringify(registeredUser));
      setToken(authToken);
      setUser(registeredUser);
      return res;
    }
    throw new Error(res.message || 'Registration failed.');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('connectly_user', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('connectly_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('[AuthContext] Error refreshing user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
