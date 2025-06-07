import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, CircularProgress, Slider } from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';
import GameAnimations from '../../components/GameAnimations/GameAnimations';
import { motion, AnimatePresence } from 'framer-motion';

const NumberGuess = () => {
  const [bet, setBet] = useState('');
  const [guessing, setGuessing] = useState(false);
  const [result, setResult] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [prediction, setPrediction] = useState(50);

  const handlePlay = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    setGuessing(true);
    setShowAnimation(false);
    try {
      const response = await API.post('/games/number/play', {
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
      toast.error(error.response?.data?.detail || 'Failed to play');
    } finally {
      setGuessing(false);
    }
  };

  const numberVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: { 
      scale: 0, 
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  const sliderVariants = {
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
          Number Guess
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
          <motion.div
            variants={sliderVariants}
            initial="initial"
            animate="animate"
          >
            <Box sx={{ mt: 4, px: 2 }}>
              <Typography gutterBottom>
                Your Prediction: {prediction}
              </Typography>
              <Slider
                value={prediction}
                onChange={(_, value) => setPrediction(value)}
                min={1}
                max={100}
                valueLabelDisplay="auto"
                disabled={guessing}
              />
            </Box>
          </motion.div>
        </Box>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handlePlay}
          disabled={guessing}
          sx={{ height: 48 }}
        >
          {guessing ? <CircularProgress size={24} /> : 'Guess'}
        </Button>
        {result && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={result.random_number}
                variants={numberVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Typography variant="h3" gutterBottom>
                  {result.random_number}
                </Typography>
              </motion.div>
            </AnimatePresence>
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
            gameType="number"
          />
        )}
      </AnimatePresence>
    </Container>
  );
};

export default NumberGuess;
