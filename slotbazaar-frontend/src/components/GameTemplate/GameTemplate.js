import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  useTheme,
  CircularProgress,
  Alert,
  Fade,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const GameTemplate = ({
  title,
  description,
  minBet,
  maxBet,
  rtp,
  gameComponent: GameComponent,
  gameEndpoint,
  onGameResult,
  gameType,
}) => {
  const theme = useTheme();
  const { user, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Reset result display after animation
  useEffect(() => {
    if (showResult) {
      const timer = setTimeout(() => {
        setShowResult(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showResult]);

  const handleBetChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setBetAmount(value);
      setError('');
    }
  };

  const validateBet = () => {
    const amount = parseFloat(betAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid bet amount');
      return false;
    }
    if (amount < minBet) {
      setError(`Minimum bet is $${minBet}`);
      return false;
    }
    if (amount > maxBet) {
      setError(`Maximum bet is $${maxBet}`);
      return false;
    }
    const currentBalance = parseFloat(user.balance || 0);
    if (amount > currentBalance) {
      setError('Insufficient balance');
      return false;
    }
    return true;
  };

  const handlePlay = async () => {
    if (!validateBet()) return;

    setLoading(true);
    setError('');
    try {
      const response = await axios.post(gameEndpoint, {
        bet: parseFloat(betAmount),
      });
      
      const result = response.data;
      setGameState(result);
      
      // Update balance with animation
      const oldBalance = parseFloat(user.balance || 0);
      const newBalance = parseFloat(result.newBalance);
      const difference = newBalance - oldBalance;
      
      // Show result animation
      setLastResult({
        win: result.win,
        amount: Math.abs(difference),
        gameType: gameType,
      });
      setShowResult(true);
      
      // Update balance in context
      updateBalance(result.newBalance);
      
      if (onGameResult) {
        onGameResult(result);
      }

      // Show appropriate toast message
      if (result.win) {
        toast.success(`You won $${parseFloat(result.winAmount || 0).toFixed(2)}!`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.info('Better luck next time!', {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Game Info */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                backgroundColor: 'background.paper',
                borderRadius: 2,
                position: 'relative',
              }}
            >
              <AnimatePresence>
                {showResult && lastResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1,
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        color: lastResult.win ? 'success.main' : 'error.main',
                        fontWeight: 'bold',
                        textShadow: '0 0 10px rgba(0,0,0,0.2)',
                      }}
                    >
                      {lastResult.win ? '+' : '-'}${lastResult.amount.toFixed(2)}
                    </Typography>
                  </motion.div>
                )}
              </AnimatePresence>

              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ color: 'primary.main', fontWeight: 'bold' }}
              >
                {title}
              </Typography>
              <Typography variant="body1" paragraph>
                {description}
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Game Details:
                </Typography>
                <Typography variant="body2">
                  • Minimum Bet: ${minBet}
                </Typography>
                <Typography variant="body2">
                  • Maximum Bet: ${maxBet}
                </Typography>
                <Typography variant="body2">
                  • RTP: {rtp}%
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Your Balance:
                </Typography>
                <motion.div
                  key={user?.balance}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <Typography
                    variant="h5"
                    sx={{ color: 'primary.main', fontWeight: 'bold' }}
                  >
                    ${parseFloat(user?.balance || 0).toFixed(2)}
                  </Typography>
                </motion.div>
              </Box>
              <TextField
                fullWidth
                label="Bet Amount"
                variant="outlined"
                type="text"
                value={betAmount}
                onChange={handleBetChange}
                error={!!error}
                helperText={error}
                InputProps={{
                  startAdornment: '$',
                }}
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handlePlay}
                disabled={loading}
                sx={{
                  py: 1.5,
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Play Now'
                )}
              </Button>
            </Paper>
          </motion.div>
        </Grid>

        {/* Game Component */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                backgroundColor: 'background.paper',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 400,
                position: 'relative',
              }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                  {error}
                </Alert>
              )}
              <GameComponent
                gameState={gameState}
                loading={loading}
                onPlay={handlePlay}
                gameType={gameType}
              />
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GameTemplate; 