import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';
import GameAnimations from '../../components/GameAnimations/GameAnimations';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const ReelSlot = () => {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const handlePlay = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (parseFloat(bet) > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setSpinning(true);
    setShowAnimation(false);
    try {
      const response = await API.post('/games/slot', {
        bet_amount: parseFloat(bet)
      });
      setResult(response.data);
      
      // Update balance with the new balance from the response
      if (response.data.new_balance !== undefined) {
        updateBalance(response.data.new_balance);
      }
      
      // Show animation after a short delay
      setTimeout(() => {
        setShowAnimation(true);
      }, 1000);

      if (response.data.net_win_loss >= 0) {
        toast.success(`You won $${response.data.net_win_loss}!`, {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        toast.info('Better luck next time!', {
          position: "top-center",
          autoClose: 2000,
        });
      }
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

  const reelVariants = {
    spinning: {
      rotate: [0, 360],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        ease: "linear"
      }
    },
    stopped: {
      rotate: 0
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, position: 'relative' }}>
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
                <motion.div
                  key={index}
                  variants={reelVariants}
                  animate={spinning ? "spinning" : "stopped"}
                >
                  <Typography variant="h3">
                    {getSymbolEmoji(symbol)}
                  </Typography>
                </motion.div>
              ))}
            </Box>
            <Typography>
              Payout Rate: {result.payout_rate_on_win}x
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

      {/* Game Animations */}
      <AnimatePresence>
        {showAnimation && result && (
          <GameAnimations
            result={result.net_win_loss >= 0 ? 'win' : 'lose'}
            winnings={result.net_win_loss}
            gameType="slots"
          />
        )}
      </AnimatePresence>
    </Container>
  );
};

export default ReelSlot;
