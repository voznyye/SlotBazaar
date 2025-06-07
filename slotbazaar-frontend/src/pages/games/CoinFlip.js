import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const MAX_BET = 1000; // Maximum bet amount
const MIN_BET = 1; // Minimum bet amount

export default function CoinFlip() {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [choice, setChoice] = useState('heads');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameState, setGameState] = useState('idle'); // idle, playing, result

  useEffect(() => {
    // Reset game state when component mounts
    return () => {
      setBet('');
      setChoice('heads');
      setResult(null);
      setError(null);
      setGameState('idle');
    };
  }, []);

  const validateBet = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < MIN_BET) {
      return `Minimum bet is ${MIN_BET}`;
    }
    if (numValue > MAX_BET) {
      return `Maximum bet is ${MAX_BET}`;
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

  const handlePlay = async (e) => {
    e.preventDefault();
    
    const error = validateBet(bet);
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    setGameState('playing');
    setError(null);

    try {
      const response = await API.post('/games/coin/', {
        bet: parseFloat(bet),
        choice,
      });

      setResult(response.data);
      updateBalance(response.data.new_balance);
      setGameState('result');

      if (response.data.result === 'win') {
        toast.success(`You won $${response.data.winnings}!`);
      } else {
        toast.info('Better luck next time!');
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Something went wrong');
      toast.error(error.response?.data?.detail || 'Game failed');
      setGameState('idle');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAgain = () => {
    setBet('');
    setChoice('heads');
    setResult(null);
    setError(null);
    setGameState('idle');
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Coin Flip
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {gameState === 'result' ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color={result.result === 'win' ? 'success.main' : 'error.main'}>
                {result.result === 'win' ? 'You Won!' : 'You Lost'}
              </Typography>
              <Typography variant="body1">
                Outcome: {result.outcome}
              </Typography>
              <Typography variant="body1">
                Winnings: {result.winnings}
              </Typography>
              <Typography variant="body1">
                New Balance: {result.new_balance}
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
            <form onSubmit={handlePlay}>
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
                      min: MIN_BET,
                      max: MAX_BET,
                      step: 1,
                    },
                  }}
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth>
                  <InputLabel>Choose Side</InputLabel>
                  <Select
                    value={choice}
                    label="Choose Side"
                    onChange={(e) => setChoice(e.target.value)}
                  >
                    <MenuItem value="heads">Heads</MenuItem>
                    <MenuItem value="tails">Tails</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading || !!error || gameState === 'playing'}
                sx={{ height: 48 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Flip Coin'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
