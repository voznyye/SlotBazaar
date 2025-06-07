import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';
import GameAnimations from '../../components/GameAnimations/GameAnimations';
import { motion, AnimatePresence } from 'framer-motion';

const HighLowCard = () => {
  const [bet, setBet] = useState('');
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [prediction, setPrediction] = useState('higher');

  const handlePlay = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    setPlaying(true);
    setShowAnimation(false);
    try {
      const response = await API.post('/games/highlow/play', {
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
      setPlaying(false);
    }
  };

  const getCardColor = (suit) => {
    return suit === '♥' || suit === '♦' ? 'red' : 'black';
  };

  const cardVariants = {
    initial: { 
      rotateY: 90,
      opacity: 0,
      scale: 0.8
    },
    animate: { 
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: { 
      rotateY: -90,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    selected: { 
      scale: 1.05,
      boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, position: 'relative' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          High Low Card
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
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
            {['higher', 'lower'].map((option) => (
              <motion.div
                key={option}
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                animate={prediction === option ? "selected" : "initial"}
                onClick={() => setPrediction(option)}
                style={{ cursor: 'pointer' }}
              >
                <Button
                  variant={prediction === option ? "contained" : "outlined"}
                  color="primary"
                  size="large"
                  sx={{ minWidth: 120 }}
                >
                  {option.toUpperCase()}
                </Button>
              </motion.div>
            ))}
          </Box>
        </Box>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handlePlay}
          disabled={playing}
          sx={{ height: 48 }}
        >
          {playing ? <CircularProgress size={24} /> : 'Play'}
        </Button>
        {result && (
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  First Card
                </Typography>
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 120,
                      backgroundColor: 'white',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                      color: getCardColor(result.first_card.suit),
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                    }}
                  >
                    <Typography variant="h6">{result.first_card.value}</Typography>
                    <Typography variant="h4">{result.first_card.suit}</Typography>
                  </Box>
                </motion.div>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Second Card
                </Typography>
                <motion.div
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 120,
                      backgroundColor: 'white',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                      color: getCardColor(result.second_card.suit),
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                    }}
                  >
                    <Typography variant="h6">{result.second_card.value}</Typography>
                    <Typography variant="h4">{result.second_card.suit}</Typography>
                  </Box>
                </motion.div>
              </Box>
            </Box>
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
            gameType="highlow"
          />
        )}
      </AnimatePresence>
    </Container>
  );
};

export default HighLowCard;
