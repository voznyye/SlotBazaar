import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';
import GameAnimations from '../../components/GameAnimations/GameAnimations';
import { motion, AnimatePresence } from 'framer-motion';

const RockPaperScissors = () => {
  const [bet, setBet] = useState('');
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [choice, setChoice] = useState('rock');

  const handlePlay = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    setPlaying(true);
    setShowAnimation(false);
    try {
      const response = await API.post('/games/rps/play', {
        bet_amount: parseFloat(bet),
        choice: choice
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

  const getEmoji = (choice) => {
    switch (choice) {
      case 'rock': return '✊';
      case 'paper': return '✋';
      case 'scissors': return '✌️';
      default: return '?';
    }
  };

  const choiceVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.9 },
    selected: { 
      scale: 1.1,
      boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
    }
  };

  const resultVariants = {
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

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, position: 'relative' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Rock Paper Scissors
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
          <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
            {['rock', 'paper', 'scissors'].map((option) => (
              <motion.div
                key={option}
                variants={choiceVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                animate={choice === option ? "selected" : "initial"}
                onClick={() => setChoice(option)}
                style={{ cursor: 'pointer' }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                  }}
                >
                  {getEmoji(option)}
                </Box>
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
                  Your Choice
                </Typography>
                <motion.div
                  variants={resultVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    }}
                  >
                    {getEmoji(result.player_choice)}
                  </Box>
                </motion.div>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Computer's Choice
                </Typography>
                <motion.div
                  variants={resultVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    }}
                  >
                    {getEmoji(result.computer_choice)}
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
            gameType="rps"
          />
        )}
      </AnimatePresence>
    </Container>
  );
};

export default RockPaperScissors;
