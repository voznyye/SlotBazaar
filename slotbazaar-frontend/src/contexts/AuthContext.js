import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext(null);

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await API.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await API.post('/auth/login', {
        username,
        password,
      });
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setUser(userData);
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
    setUser(null);
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
