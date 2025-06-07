import React, { useState } from 'react';
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
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../../api';

const DiceRoll = () => {
  const [bet, setBet] = useState('');
  const [prediction, setPrediction] = useState('1');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rolling, setRolling] = useState(false);

  const handlePlay = async (e) => {
    e.preventDefault();
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    setLoading(true);
    setRolling(true);
    try {
      const response = await API.post('/games/dice/roll', { bet, prediction });
      setResult(response.data);
      toast.success(response.data.result === 'win' ? 'You won!' : 'Better luck next time!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setTimeout(() => setRolling(false), 1000);
    }
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

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              height: 150,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={rolling ? 'rolling' : 'static'}
                variants={diceVariants}
                initial="initial"
                animate={rolling ? 'rolling' : 'final'}
                style={{
                  width: 100,
                  height: 100,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  color: 'white',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }}
              >
                {result?.outcome || '?'}
              </motion.div>
            </AnimatePresence>
          </Box>

          <form onSubmit={handlePlay}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Bet Amount"
                type="number"
                value={bet}
                onChange={(e) => setBet(e.target.value)}
                InputProps={{ inputProps: { min: 1 } }}
                sx={{ mb: 2 }}
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
              disabled={loading}
              sx={{ height: 48 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Roll Dice'}
            </Button>
          </form>

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
                Rolled: {result.outcome}
              </Typography>
              <Typography variant="body1">
                Winnings: {result.winnings}
              </Typography>
              <Typography variant="body1">
                New Balance: {result.new_balance}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DiceRoll;
