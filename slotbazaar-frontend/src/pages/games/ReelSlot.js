import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';

const ReelSlot = () => {
  const [bet, setBet] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const handlePlay = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    setSpinning(true);
    try {
      const response = await API.post('/games/slot/play', {
        bet_amount: parseFloat(bet)
      });
      setResult(response.data);
      toast.success(`You ${response.data.net_win_loss >= 0 ? 'won' : 'lost'} ${Math.abs(response.data.net_win_loss)} coins!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to spin');
    } finally {
      setSpinning(false);
    }
  };

  const getSymbolEmoji = (symbol) => {
    switch (symbol) {
      case 'C': return '🍒';
      case 'L': return '🍋';
      case 'B': return '🍺';
      default: return '?';
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Reel Slot
        </Typography>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Bet Amount"
            type="number"
            value={bet}
            onChange={(e) => setBet(e.target.value)}
            margin="normal"
            InputProps={{
              inputProps: { min: 0, step: 0.01 }
            }}
          />
        </Box>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handlePlay}
          disabled={spinning}
          sx={{ height: 48 }}
        >
          {spinning ? <CircularProgress size={24} /> : 'Spin'}
        </Button>
        {result && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Result
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
              {result.combination.map((symbol, index) => (
                <Typography key={index} variant="h3">
                  {getSymbolEmoji(symbol)}
                </Typography>
              ))}
            </Box>
            <Typography>
              Payout Rate: {result.payout_rate_on_win}x
            </Typography>
            <Typography>
              Winnings: {result.winnings}
            </Typography>
            <Typography>
              Net Win/Loss: {result.net_win_loss}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ReelSlot;
