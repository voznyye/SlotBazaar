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
  Container,
  Paper,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const RockPaperScissors = () => {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [choice, setChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealing, setRevealing] = useState(false);

  const handlePlay = async (selectedChoice) => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (parseFloat(bet) > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setChoice(selectedChoice);
    setLoading(true);
    setRevealing(true);
    try {
      const response = await API.post('/games/rps/play', { bet_amount: bet, choice: selectedChoice });
      setResult(response.data);
      
      // Update balance with the new balance from the response
      updateBalance(response.data.new_balance);

      toast.success(response.data.result === 'win' ? 'You won!' : 'Better luck next time!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
      setTimeout(() => setRevealing(false), 1000);
    }
  };

  const getEmoji = (choice) => {
    switch (choice) {
      case 'Rock': return '✊';
      case 'Paper': return '✋';
      case 'Scissors': return '✌️';
      default: return '?';
    }
  };

  const choiceVariants = {
    initial: { scale: 1, rotate: 0 },
    revealing: {
      scale: [1, 1.2, 1],
      rotate: [0, 360],
      transition: { duration: 1, ease: "easeInOut" }
    },
    final: { scale: 1, rotate: 0 }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Rock Paper Scissors
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

            <Grid container spacing={2} sx={{ mb: 3 }}>
              {['Rock', 'Paper', 'Scissors'].map((option) => (
                <Grid item xs={4} key={option}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => handlePlay(option)}
                    disabled={loading}
                    sx={{
                      height: 120,
                      fontSize: '3rem',
                      textTransform: 'none',
                    }}
                  >
                    {getEmoji(option)}
                  </Button>
                </Grid>
              ))}
            </Grid>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
                mb: 3,
                height: 150,
              }}
            >
              {result && (
                <>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: 'background.paper',
                      boxShadow: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 48,
                    }}
                  >
                    {getEmoji(choice)}
                  </Box>
                  <Typography variant="h4">VS</Typography>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={revealing ? 'revealing' : 'static'}
                      variants={choiceVariants}
                      initial="initial"
                      animate={revealing ? 'revealing' : 'final'}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 48,
                      }}
                    >
                      {getEmoji(result.computer_choice)}
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </Box>

            {result && (
              <Box
                sx={{
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
                  Your choice: {choice}
                </Typography>
                <Typography variant="body1">
                  Computer's choice: {result.computer_choice}
                </Typography>
                <Typography variant="body1">
                  Winnings: ${result.winnings}
                </Typography>
                <Typography variant="body1">
                  New Balance: ${result.new_balance}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RockPaperScissors;
