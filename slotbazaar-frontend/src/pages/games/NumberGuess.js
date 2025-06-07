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
  Grid,
  Container,
  Paper,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../../api';

const NumberGuess = () => {
  const [bet, setBet] = useState('');
  const [guess, setGuess] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealing, setRevealing] = useState(false);

  const handlePlay = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    setLoading(true);
    setRevealing(true);
    try {
      const response = await API.post('/games/guess/play', { bet_amount: bet, guess });
      setResult(response.data);
      toast.success(response.data.result === 'win' ? 'You won!' : 'Better luck next time!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setTimeout(() => setRevealing(false), 1000);
    }
  };

  const numberVariants = {
    initial: { scale: 1, opacity: 0.5 },
    revealing: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 1],
      transition: { duration: 1, ease: "easeInOut" }
    },
    final: { scale: 1, opacity: 1 }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Number Guess
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

            <Typography gutterBottom>
              Guess a number between 1 and 10
            </Typography>
            <Slider
              value={guess}
              onChange={(_, value) => setGuess(value)}
              min={1}
              max={10}
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 3,
                height: 120,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={revealing ? 'revealing' : 'static'}
                  variants={numberVariants}
                  initial="initial"
                  animate={revealing ? 'revealing' : 'final'}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 36,
                    color: 'white',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  {result?.number || guess}
                </motion.div>
              </AnimatePresence>
            </Box>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handlePlay}
              disabled={loading}
              sx={{ height: 48 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Make Guess'}
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
                  Your guess: {guess}
                </Typography>
                <Typography variant="body1">
                  Actual number: {result.number}
                </Typography>
                <Typography variant="body1">
                  Winnings: {result.winnings}
                </Typography>
                <Typography variant="body1">
                  New Balance: {result.new_balance}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NumberGuess;
