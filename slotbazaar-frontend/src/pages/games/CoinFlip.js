import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';
import GameAnimations from '../../components/GameAnimations/GameAnimations';
import { motion, AnimatePresence } from 'framer-motion';

const CoinFlip = () => {
  const [bet, setBet] = useState('');
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [prediction, setPrediction] = useState('heads'); // 'heads' or 'tails'

  const handlePlay = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    setFlipping(true);
    setShowAnimation(false);
    try {
      const response = await API.post('/games/coinflip/play', {
        bet_amount: parseFloat(bet),
        prediction: prediction
      });
      setResult(response.data);
      
      // Show animation after a short delay
      setTimeout(() => {
        setShowAnimation(true);
      }, 1000);

      if (response.data.net_win_loss >= 0) {
        toast.success(`You won ${response.data.net_win_loss} coins!`, {
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
      toast.error(error.response?.data?.detail || 'Failed to flip coin');
    } finally {
      setFlipping(false);
    }
  };

  const coinVariants = {
    flipping: {
      rotateY: [0, 360, 720, 1080, 1440],
      scale: [1, 1.2, 1, 1.2, 1],
      transition: {
        duration: 2,
        ease: "easeInOut"
      }
    },
    heads: {
      rotateY: 0,
      scale: 1
    },
    tails: {
      rotateY: 180,
      scale: 1
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, position: 'relative' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Coin Flip
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
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant={prediction === 'heads' ? 'contained' : 'outlined'}
              onClick={() => setPrediction('heads')}
              fullWidth
            >
              Heads
            </Button>
            <Button
              variant={prediction === 'tails' ? 'contained' : 'outlined'}
              onClick={() => setPrediction('tails')}
              fullWidth
            >
              Tails
            </Button>
          </Box>
        </Box>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handlePlay}
          disabled={flipping}
          sx={{ height: 48 }}
        >
          {flipping ? <CircularProgress size={24} /> : 'Flip Coin'}
        </Button>
        {result && (
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div
              variants={coinVariants}
              animate={flipping ? "flipping" : result.result === 'heads' ? "heads" : "tails"}
              style={{
                perspective: '1000px',
                marginBottom: '20px'
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  backgroundColor: '#FFD700',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                  fontSize: '2rem'
                }}
              >
                {result.result === 'heads' ? 'H' : 'T'}
              </Box>
            </motion.div>
            <Typography variant="h6" gutterBottom>
              Result: {result.result.toUpperCase()}
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

      {/* Game Animations */}
      <AnimatePresence>
        {showAnimation && result && (
          <GameAnimations
            result={result.net_win_loss >= 0 ? 'win' : 'lose'}
            winnings={result.net_win_loss}
            gameType="coinflip"
          />
        )}
      </AnimatePresence>
    </Container>
  );
};

export default CoinFlip;
