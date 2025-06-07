import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  AccountBalance,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Balance = () => {
  const theme = useTheme();
  const { user, updateBalance } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Отладка: вывод типа balance в консоль
  console.log('Balance type:', typeof user?.balance, 'Balance value:', user?.balance);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setAmount('');
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/user/deposit', {
        amount: parseFloat(amount),
      });
      updateBalance(response.data.balance);
      toast.success('Deposit successful!');
      setAmount('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const currentBalance = parseFloat(user.balance || 0);
    if (parseFloat(amount) > currentBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/user/withdraw', {
        amount: parseFloat(amount),
      });
      updateBalance(response.data.balance);
      toast.success('Withdrawal successful!');
      setAmount('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Balance Card */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'background.paper',
                borderRadius: 2,
              }}
            >
              <AccountBalance
                sx={{ fontSize: 60, color: 'primary.main', mb: 2 }}
              />
              <Typography variant="h4" component="h1" gutterBottom>
                Current Balance
              </Typography>
              <Typography
                variant="h3"
                component="p"
                sx={{ color: 'primary.main', fontWeight: 'bold' }}
              >
                ${user ? (parseFloat(user.balance || 0).toFixed(2)) : '0.00'}
              </Typography>
            </Paper>
          </motion.div>
        </Grid>

        {/* Transaction Card */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 3,
                backgroundColor: 'background.paper',
                borderRadius: 2,
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                centered
                sx={{ mb: 3 }}
              >
                <Tab
                  icon={<AddIcon />}
                  label="Deposit"
                  sx={{ color: 'success.main' }}
                />
                <Tab
                  icon={<RemoveIcon />}
                  label="Withdraw"
                  sx={{ color: 'error.main' }}
                />
              </Tabs>

              <Box sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  label="Amount"
                  variant="outlined"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  InputProps={{
                    startAdornment: '$',
                  }}
                  sx={{ mb: 3 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={activeTab === 0 ? handleDeposit : handleWithdraw}
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    backgroundColor: activeTab === 0 ? 'success.main' : 'error.main',
                    '&:hover': {
                      backgroundColor: activeTab === 0 ? 'success.dark' : 'error.dark',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : activeTab === 0 ? (
                    'Deposit'
                  ) : (
                    'Withdraw'
                  )}
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Balance;
