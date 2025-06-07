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
} from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';

const SimpleRoulette = () => {
  const [bet, setBet] = useState('');
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const numbers = Array.from({ length: 37 }, (_, i) => i); // 0-36

  const handlePlay = async (color) => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (selectedNumber === null) {
      toast.error('Please select a number');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/games/roulette/play', {
        bet_amount: parseFloat(bet),
        choice: color // 'Red' or 'Black'
      });
      setResult(response.data);
      toast.success(`You ${response.data.net_win_loss >= 0 ? 'won' : 'lost'} ${Math.abs(response.data.net_win_loss)} coins!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to play');
    } finally {
      setLoading(false);
    }
  };

  const getNumberColor = (number) => {
    if (number === 0) return 'green';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(number) ? 'red' : 'black';
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3 }}>
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
            onClick={() => handlePlay(selectedNumber === 0 ? 'Green' : selectedNumber % 2 === 0 ? 'Black' : 'Red')}
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
                Winnings: {result.winnings}
              </Typography>
              <Typography variant="body1">
                New Balance: {result.new_balance}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default SimpleRoulette;
