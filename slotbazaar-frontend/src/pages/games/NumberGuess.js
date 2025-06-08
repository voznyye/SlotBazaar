import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Slider,
  Alert,
} from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import GameAnimations from '../../components/GameAnimations/GameAnimations';
import { AnimatePresence } from 'framer-motion';

const NumberGuess = () => {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [guess, setGuess] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);

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

    const error = validateBet(bet);
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    setError(null);
    setShowAnimation(false);

    try {
      const response = await API.post('/games/guess/play', { 
        bet_amount: parseFloat(bet), 
        guess 
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
    }
  };

  const handlePlayAgain = () => {
    setBet('');
    setGuess(5);
    setResult(null);
    setError(null);
    setShowAnimation(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Number Guess
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
                Your Guess: {result.choice}
              </Typography>
              <Typography variant="body1">
                Secret Number: {result.secret_number}
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

                <Typography gutterBottom>
                  Guess a number between 1 and 10
                </Typography>
                <Slider
                  value={guess}
                  onChange={(_, value) => setGuess(value)}
                  min={1}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  sx={{ mb: 2 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading || !!error}
                  sx={{ height: 48 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Guess'}
                </Button>
              </Box>
            </form>
          )}

          <AnimatePresence>
            {showAnimation && result && (
              <GameAnimations
                result={result.net_win_loss >= 0 ? 'win' : 'lose'}
                winnings={result.winnings}
                gameType="guess"
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NumberGuess;
