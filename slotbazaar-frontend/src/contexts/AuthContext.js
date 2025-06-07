import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
      startSessionTimer();
    } else {
      setLoading(false);
    }

    // Set up activity listeners
    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, []);

  const startSessionTimer = () => {
    setInterval(() => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT) {
        handleSessionTimeout();
      }
    }, 60000); // Check every minute
  };

  const handleSessionTimeout = () => {
    toast.warning('Session expired due to inactivity');
    logout();
  };

  const refreshToken = async () => {
    try {
      const response = await API.post('/auth/refresh');
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const fetchUser = async (token) => {
    try {
      const response = await API.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password, rememberMe = false) => {
    try {
      const response = await API.post('/auth/login', {
        username,
        password,
      });
      const { access_token, user: userData } = response.data;
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      localStorage.setItem('token', access_token);
      setUser(userData);
      setLastActivity(Date.now());
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await API.post('/auth/register', {
        username,
        email,
        password,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    setUser(null);
    window.location.href = '/login';
  };

  const updateBalance = (newBalance) => {
    setUser((prevUser) => ({
      ...prevUser,
      balance: newBalance,
    }));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateBalance,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
