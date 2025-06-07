import React, { useState, useEffect } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';
import GameAnimations from '../../components/GameAnimations/GameAnimations';
import { motion, AnimatePresence } from 'framer-motion';

const ReelSlot = () => {
  const [bet, setBet] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [reels, setReels] = useState(['🍒', '🍋', '🍊']);

  const symbols = ['🍒', '🍋', '🍊', '🍇', '7️⃣', '💎'];

  const handlePlay = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    setSpinning(true);
    setShowAnimation(false);
    try {
      const response = await API.post('/games/slot/play', {
        bet_amount: parseFloat(bet)
      });
      setResult(response.data);
      
      // Animate reels
      const spinDuration = 2000; // 2 seconds
      const spinInterval = 100; // Update every 100ms
      const iterations = spinDuration / spinInterval;
      let currentIteration = 0;

      const spinIntervalId = setInterval(() => {
        setReels(prevReels => 
          prevReels.map(() => symbols[Math.floor(Math.random() * symbols.length)])
        );
        currentIteration++;

        if (currentIteration >= iterations) {
          clearInterval(spinIntervalId);
          setReels(response.data.reels);
          
          // Show animation after reels stop
          setTimeout(() => {
            setShowAnimation(true);
          }, 500);

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
        }
      }, spinInterval);

    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to play');
    } finally {
      setSpinning(false);
    }
  };

  const reelVariants = {
    spin: {
      rotateX: [0, 360],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        ease: "linear"
      }
    },
    stop: {
      rotateX: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const symbolVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, position: 'relative' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Slot Machine
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
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 2, 
              mt: 4,
              perspective: '1000px'
            }}
          >
            {reels.map((symbol, index) => (
              <motion.div
                key={index}
                variants={reelVariants}
                animate={spinning ? "spin" : "stop"}
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                }}
              >
                <motion.div
                  variants={symbolVariants}
                  initial="initial"
                  animate="animate"
                >
                  {symbol}
                </motion.div>
              </motion.div>
            ))}
          </Box>
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
          <Box sx={{ mt: 3, textAlign: 'center' }}>
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
            gameType="slot"
          />
        )}
      </AnimatePresence>
    </Container>
  );
};

export default ReelSlot;
