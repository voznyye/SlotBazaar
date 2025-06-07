import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await API.get('/auth/me');
        setUser(response.data);
        await updateBalance();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async () => {
    try {
      const response = await API.get('/auth/balance');
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Failed to update balance:', error);
    }
  };

  useEffect(() => {
    checkAuth();
    // Set up interval for balance updates
    const interval = setInterval(updateBalance, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const login = async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    await updateBalance();
    return response.data;
  };

  const register = async (userData) => {
    const response = await API.post('/auth/register', userData);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    await updateBalance();
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setBalance(0);
  };

  const value = {
    user,
    loading,
    balance,
    login,
    register,
    logout,
    updateBalance
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 