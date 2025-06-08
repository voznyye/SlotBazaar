import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const BALANCE_UPDATE_INTERVAL = 30 * 1000; // 30 seconds

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
  const [transactions, setTransactions] = useState([]);
  const [lastBalanceUpdate, setLastBalanceUpdate] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
      startSessionTimer();
      startBalanceUpdateTimer();
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

  const startBalanceUpdateTimer = () => {
    setInterval(async () => {
      if (user) {
        try {
          const response = await API.get('/auth/balance');
          const newBalance = response.data.balance;
          if (newBalance !== user.balance) {
            updateBalance(newBalance);
          }
        } catch (error) {
          console.error('Balance update failed:', error);
        }
      }
    }, BALANCE_UPDATE_INTERVAL);
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
      fetchTransactions();
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

  const fetchTransactions = async () => {
    try {
      const response = await API.get('/user/transactions');
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
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
      fetchTransactions();
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
    setTransactions([]);
    window.location.href = '/login';
  };

  const updateBalance = (newBalance) => {
    const oldBalance = user?.balance || 0;
    const difference = parseFloat(newBalance) - parseFloat(oldBalance);
    
    setUser((prevUser) => ({
      ...prevUser,
      balance: newBalance,
    }));

    // Add transaction to history if there's a change
    if (difference !== 0) {
      const transaction = {
        type: difference > 0 ? 'win' : 'loss',
        amount: Math.abs(difference),
        created_at: new Date().toISOString(),
        balance_after: newBalance,
      };
      
      setTransactions((prev) => [transaction, ...(prev || [])].slice(0, 50)); // Keep last 50 transactions
      setLastBalanceUpdate(Date.now());
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateBalance,
    transactions,
    lastBalanceUpdate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
