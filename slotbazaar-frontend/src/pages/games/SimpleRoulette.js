import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Grid,
  Chip,
  Container,
  Paper,
  Alert,
} from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import GameAnimations from '../../components/GameAnimations/GameAnimations';
import { AnimatePresence } from 'framer-motion';

const SimpleRoulette = () => {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const numbers = Array.from({ length: 37 }, (_, i) => i); // 0-36

  const validateBet = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return 'Please enter a valid bet amount';
    }
    if (numValue > user.balance) {
      return 'Insufficient balance';
    }
    return null;
  };

  const handleBetChange = (e) => {
    const value = e.target.value;
    setBet(value);
    const error = validateBet(value);
    setError(error);
  };

  const handlePlay = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (selectedNumber === null) {
      toast.error('Please select a number');
      return;
    }

    const error = validateBet(bet);
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    setSpinning(true);
    setError(null);
    setShowAnimation(false);

    try {
      const response = await API.post('/games/roulette/play', { 
        bet_amount: parseFloat(bet), 
        choice: selectedNumber 
      });
      
      setResult(response.data);
      updateBalance(response.data.new_balance);
      
      // Show animation after a short delay
      setTimeout(() => {
        setShowAnimation(true);
      }, 500);

      if (response.data.net_win_loss >= 0) {
        toast.success(`You won $${response.data.winnings}!`);
      } else {
        toast.info('Better luck next time!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Game failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setSpinning(false);
    }
  };

  const handlePlayAgain = () => {
    setBet('');
    setSelectedNumber(null);
    setResult(null);
    setError(null);
    setShowAnimation(false);
  };

  const getNumberColor = (number) => {
    if (number === 0) return 'green';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(number) ? 'red' : 'black';
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Simple Roulette
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {result ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color={result.net_win_loss >= 0 ? 'success.main' : 'error.main'}>
                {result.net_win_loss >= 0 ? 'You Won!' : 'You Lost'}
              </Typography>
              <Typography variant="body1">
                Outcome: {result.outcome_number} ({result.outcome_color})
              </Typography>
              <Typography variant="body1">
                Winnings: ${result.winnings}
              </Typography>
              <Typography variant="body1">
                New Balance: ${result.new_balance}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePlayAgain}
                sx={{ mt: 2 }}
              >
                Play Again
              </Button>
            </Box>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handlePlay(); }}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Bet Amount"
                  type="number"
                  value={bet}
                  onChange={handleBetChange}
                  error={!!error}
                  helperText={error}
                  InputProps={{
                    inputProps: {
                      min: 1,
                      step: 1,
                    },
                  }}
                  sx={{ mb: 2 }}
                />

                <Typography variant="h6" gutterBottom>
                  Select a Number
                </Typography>

                <Grid container spacing={1} sx={{ mb: 3 }}>
                  {numbers.map((number) => (
                    <Grid item key={number}>
                      <Chip
                        label={number}
                        onClick={() => setSelectedNumber(number)}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: selectedNumber === number ? 'primary.main' : getNumberColor(number),
                          color: selectedNumber === number ? 'white' : 'white',
                          '&:hover': {
                            bgcolor: selectedNumber === number ? 'primary.dark' : getNumberColor(number),
                          },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading || spinning || !!error}
                  sx={{ height: 48 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Spin'}
                </Button>
              </Box>
            </form>
          )}

          <AnimatePresence>
            {showAnimation && result && (
              <GameAnimations
                result={result.net_win_loss >= 0 ? 'win' : 'lose'}
                winnings={result.winnings}
                gameType="roulette"
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SimpleRoulette;
