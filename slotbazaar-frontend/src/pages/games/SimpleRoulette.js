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
  Container,
  Paper,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const SimpleRoulette = () => {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [number, setNumber] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const handlePlay = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (parseFloat(bet) > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    setSpinning(true);
    try {
      const response = await API.post('/games/roulette', { bet_amount: bet, number });
      setResult(response.data);
      
      // Update balance with the new balance from the response
      if (response.data.new_balance !== undefined) {
        updateBalance(response.data.new_balance);
      }

      toast.success(response.data.result === 'win' ? 'You won!' : 'Better luck next time!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
      setTimeout(() => setSpinning(false), 1000);
    }
  };

  const wheelVariants = {
    initial: { rotate: 0 },
    spinning: {
      rotate: [0, 360, 720, 1080],
      transition: { duration: 1, ease: "easeInOut" }
    },
    final: { rotate: 0 }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Simple Roulette
          </Typography>

          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              label="Bet Amount"
              type="number"
              value={bet}
              onChange={(e) => setBet(e.target.value)}
              InputProps={{ inputProps: { min: 1 } }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Number (0-36)"
              type="number"
              value={number}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 0 && value <= 36) {
                  setNumber(value);
                }
              }}
              InputProps={{ inputProps: { min: 0, max: 36 } }}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handlePlay}
              disabled={loading}
              sx={{ height: 48 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Spin'}
            </Button>

            {result && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: result.result === 'win' ? 'success.light' : 'error.light',
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6">
                  {result.result === 'win' ? 'You Won!' : 'You Lost'}
                </Typography>
                <Typography variant="body1">
                  Winning Number: {result.winning_number}
                </Typography>
                <Typography variant="body1">
                  Your Number: {result.your_number}
                </Typography>
                <Typography variant="body1">
                  Winnings: ${result.winnings}
                </Typography>
                <Typography variant="body1">
                  New Balance: ${result.new_balance}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SimpleRoulette;
