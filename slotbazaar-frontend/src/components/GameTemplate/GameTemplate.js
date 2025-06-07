import React, { useState } from 'react';
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
} from '@mui/material';
import { motion } from 'framer-motion';
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
}) => {
  const theme = useTheme();
  const { user, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');

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
    if (amount > user.balance) {
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
      
      setGameState(response.data);
      updateBalance(response.data.newBalance);
      
      if (onGameResult) {
        onGameResult(response.data);
      }

      if (response.data.win) {
        toast.success(`You won $${response.data.winAmount.toFixed(2)}!`);
      } else {
        toast.info('Better luck next time!');
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'An error occurred');
      toast.error('Game error occurred');
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
              }}
            >
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
                <Typography
                  variant="h5"
                  sx={{ color: 'primary.main', fontWeight: 'bold' }}
                >
                  ${user?.balance?.toFixed(2) || '0.00'}
                </Typography>
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
              />
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GameTemplate; 