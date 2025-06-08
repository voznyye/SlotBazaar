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
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import GameAnimations from '../../components/GameAnimations/GameAnimations';

const DiceRoll = () => {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [prediction, setPrediction] = useState('1');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    return () => {
      setBet('');
      setPrediction('1');
      setResult(null);
      setError(null);
      setRolling(false);
      setShowAnimation(false);
    };
  }, []);

  const handlePlay = async (e) => {
    e.preventDefault();
    
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    if (!prediction || prediction < 1 || prediction > 6) {
      toast.error('Please select a valid number (1-6)');
      return;
    }

    if (parseFloat(bet) > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    setRolling(true);
    setError(null);
    setShowAnimation(false);

    try {
      const response = await API.post('/games/dice/play', {
        bet_amount: parseFloat(bet),
        number: parseInt(prediction)
      });

      setResult(response.data);
      
      // Update balance with the new balance from the response
      updateBalance(response.data.new_balance);

      // Show animation after a short delay
      setTimeout(() => {
        setShowAnimation(true);
      }, 500);

      if (response.data.result === 'win') {
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
      setRolling(false);
    }
  };

  const handlePlayAgain = () => {
    setBet('');
    setPrediction('1');
    setResult(null);
    setError(null);
    setShowAnimation(false);
  };

  const diceVariants = {
    initial: { rotate: 0 },
    rolling: {
      rotate: [0, 360, 720, 1080],
      transition: { duration: 1, ease: "easeInOut" }
    },
    final: { rotate: 0 }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Dice Roll
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {result ? (
            <Box
              sx={{
                p: 3,
                borderRadius: 2,
                background: result.result === 'win' 
                  ? 'linear-gradient(145deg, rgba(0, 255, 0, 0.1), rgba(0, 255, 0, 0.2))'
                  : 'linear-gradient(145deg, rgba(255, 0, 0, 0.1), rgba(255, 0, 0, 0.2))',
                border: `1px solid ${result.result === 'win' ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)'}`,
                color: result.result === 'win' ? '#00ff00' : '#ff4444',
                textAlign: 'center',
                mb: 3,
                textShadow: `0 0 10px ${result.result === 'win' ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)'}`,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                {result.result === 'win' ? 'You Won!' : 'You Lost'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Rolled: {result.outcome}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Winnings: ${result.winnings}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                New Balance: ${result.new_balance}
              </Typography>
              <Button
                variant="contained"
                onClick={handlePlayAgain}
                sx={{
                  background: 'linear-gradient(45deg, #00ffff, #0066ff)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00cccc, #0055cc)',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                  },
                }}
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
                  onChange={(e) => setBet(e.target.value)}
                  error={!!error}
                  helperText={error}
                  InputProps={{
                    inputProps: { min: 1, step: 0.01 },
                  }}
                  sx={{
                    mb: 2,
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

                <FormControl fullWidth>
                  <InputLabel>Predict Number</InputLabel>
                  <Select
                    value={prediction}
                    label="Predict Number"
                    onChange={(e) => setPrediction(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <MenuItem key={num} value={num.toString()}>
                        {num}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading || rolling}
                sx={{ height: 48 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Roll Dice'}
              </Button>
            </form>
          )}

          <AnimatePresence>
            {showAnimation && result && (
              <GameAnimations
                result={result.result}
                winnings={result.winnings}
                gameType="dice"
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DiceRoll;
