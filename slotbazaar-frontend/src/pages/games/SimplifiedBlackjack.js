import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const SimplifiedBlackjack = () => {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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
    try {
      const response = await API.post('/games/blackjack/play', {
        bet_amount: parseFloat(bet)
      });
      setResult(response.data);
      
      // Update balance with the new balance from the response
      updateBalance(response.data.new_balance);

      toast.success(`You ${response.data.net_win_loss >= 0 ? 'won' : 'lost'} $${Math.abs(response.data.net_win_loss)}!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to play');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Simplified Blackjack
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
          disabled={loading}
          sx={{ height: 48 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Play'}
        </Button>
        {result && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Result
            </Typography>
            <Typography>
              Player Hand: {result.player_hand.join(', ')} (Value: {result.player_value})
            </Typography>
            <Typography>
              Dealer Hand: {result.dealer_hand.join(', ')} (Value: {result.dealer_value})
            </Typography>
            <Typography>
              Result: {result.result_status}
            </Typography>
            <Typography>
              Winnings: ${result.winnings}
            </Typography>
            <Typography>
              Net Win/Loss: ${result.net_win_loss}
            </Typography>
            <Typography>
              New Balance: ${result.new_balance}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SimplifiedBlackjack;
