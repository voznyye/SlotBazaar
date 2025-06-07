import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../api';
import { useAuth } from '../contexts/AuthContext';

const Deposit = () => {
  const { user, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await API.post('/auth/deposit', {
        amount: parseFloat(amount)
      });

      updateBalance(response.data.balance);
      toast.success(`Successfully deposited $${amount}`);
      setAmount('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to process deposit');
      toast.error(error.response?.data?.message || 'Failed to process deposit');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card
          sx={{
            background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
            border: '1px solid rgba(0, 255, 255, 0.1)',
            mb: 4,
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              gutterBottom
              align="center"
              sx={{
                color: '#00ffff',
                textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                fontWeight: 'bold',
                mb: 4,
              }}
            >
              Deposit Funds
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  color: '#ff4444',
                }}
              >
                {error}
              </Alert>
            )}

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <Paper
                    sx={{
                      p: 3,
                      background: 'linear-gradient(145deg, rgba(0, 255, 255, 0.05), rgba(0, 102, 255, 0.05))',
                      border: '1px solid rgba(0, 255, 255, 0.1)',
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#00ffff',
                        mb: 2,
                        textShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                      }}
                    >
                      Current Balance
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        color: '#00ffff',
                        fontWeight: 'bold',
                        textShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                      }}
                    >
                      ${(Number(user?.balance) || 0).toFixed(2)}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <form onSubmit={handleDeposit}>
                    <TextField
                      fullWidth
                      label="Deposit Amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      error={!!error}
                      InputProps={{
                        inputProps: { min: 1, step: 0.01 },
                      }}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          color: '#00ffff',
                          '& fieldset': {
                            borderColor: 'rgba(0, 255, 255, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(0, 255, 255, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#00ffff',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(0, 255, 255, 0.7)',
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ff4444',
                        },
                      }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      type="submit"
                      disabled={loading}
                      sx={{
                        height: 48,
                        background: 'linear-gradient(45deg, #00ffff, #0066ff)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #00cccc, #0055cc)',
                          boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                        },
                        '&:disabled': {
                          background: 'rgba(0, 255, 255, 0.2)',
                          color: 'rgba(255, 255, 255, 0.5)',
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        'Deposit Now'
                      )}
                    </Button>
                  </form>
                </motion.div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card
          sx={{
            background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
            border: '1px solid rgba(0, 255, 255, 0.1)',
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                color: '#00ffff',
                textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                mb: 2,
              }}
            >
              Deposit Information
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 2,
              }}
            >
              • Minimum deposit amount: $1.00
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 2,
              }}
            >
              • Deposits are processed instantly
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              • No fees for deposits
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Deposit;
