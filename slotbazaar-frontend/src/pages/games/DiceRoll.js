import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';
import GameAnimations from '../../components/GameAnimations/GameAnimations';
import { motion, AnimatePresence } from 'framer-motion';

const DiceRoll = () => {
  const [bet, setBet] = useState('');
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [prediction, setPrediction] = useState(7); // Default to 7

  const handlePlay = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    setRolling(true);
    setShowAnimation(false);
    try {
      const response = await API.post('/games/dice/play', {
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
      toast.error(error.response?.data?.detail || 'Failed to roll dice');
    } finally {
      setRolling(false);
    }
  };

  const diceVariants = {
    rolling: {
      rotate: [0, 360, 720, 1080],
      scale: [1, 1.2, 1, 1.2],
      transition: {
        duration: 1.5,
        ease: "easeInOut"
      }
    },
    stopped: {
      rotate: 0,
      scale: 1
    }
  };

  const getDiceFace = (number) => {
    const dots = [];
    const positions = {
      1: [[1, 1]],
      2: [[0, 0], [2, 2]],
      3: [[0, 0], [1, 1], [2, 2]],
      4: [[0, 0], [0, 2], [2, 0], [2, 2]],
      5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
      6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]]
    };

    return (
      <Box
        sx={{
          width: 80,
          height: 80,
          backgroundColor: 'white',
          borderRadius: '10px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          padding: '10px',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        }}
      >
        {positions[number].map(([row, col], index) => (
          <Box
            key={index}
            sx={{
              width: '15px',
              height: '15px',
              backgroundColor: 'black',
              borderRadius: '50%',
              gridRow: row + 1,
              gridColumn: col + 1,
              justifySelf: 'center',
              alignSelf: 'center',
            }}
          />
        ))}
      </Box>
    );
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, position: 'relative' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Dice Roll
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
          <TextField
            fullWidth
            label="Predict Number (1-6)"
            type="number"
            value={prediction}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 1 && value <= 6) {
                setPrediction(value);
              }
            }}
            margin="normal"
            InputProps={{
              inputProps: { min: 1, max: 6, step: 1 }
            }}
          />
        </Box>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handlePlay}
          disabled={rolling}
          sx={{ height: 48 }}
        >
          {rolling ? <CircularProgress size={24} /> : 'Roll Dice'}
        </Button>
        {result && (
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div
              variants={diceVariants}
              animate={rolling ? "rolling" : "stopped"}
              style={{
                marginBottom: '20px'
              }}
            >
              {getDiceFace(result.result)}
            </motion.div>
            <Typography variant="h6" gutterBottom>
              Result: {result.result}
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
            gameType="dice"
          />
        )}
      </AnimatePresence>
    </Container>
  );
};

export default DiceRoll;
