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

const HighLowCard = () => {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flipping, setFlipping] = useState(false);

  const handlePlay = async (choice) => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (parseFloat(bet) > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setPrediction(choice);
    setLoading(true);
    setFlipping(true);
    try {
      const response = await API.post('/games/highlow/play', { bet_amount: bet, choice: prediction });
      setResult(response.data);
      
      // Update balance with the new balance from the response
        updateBalance(response.data.new_balance);

      toast.success(response.data.result === 'win' ? 'You won!' : 'Better luck next time!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
      setTimeout(() => setFlipping(false), 1000);
    }
  };

  const cardVariants = {
    initial: { rotateY: 0 },
    flipping: {
      rotateY: [0, 180, 360, 540],
      transition: { duration: 1, ease: "easeInOut" }
    },
    final: { rotateY: 0 }
  };

  const getCardColor = (suit) => {
    return ['♥', '♦'].includes(suit) ? 'error.main' : 'text.primary';
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            High Low Card
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
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => handlePlay('High')}
                  disabled={loading}
                  sx={{ height: 100, fontSize: '1.2rem' }}
                >
                  Higher
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => handlePlay('Low')}
                  disabled={loading}
                  sx={{ height: 100, fontSize: '1.2rem' }}
                >
                  Lower
                </Button>
              </Grid>
            </Grid>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
                mb: 3,
              }}
            >
              {result && (
                <>
                  <Box
                    sx={{
                      width: 120,
                      height: 180,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      boxShadow: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 48,
                      color: getCardColor(result.current_card?.suit),
                    }}
                  >
                    {result.current_card?.value}
                    {result.current_card?.suit}
                  </Box>
                  <Typography variant="h4">→</Typography>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={flipping ? 'flipping' : 'static'}
                      variants={cardVariants}
                      initial="initial"
                      animate={flipping ? 'flipping' : 'final'}
                      style={{
                        width: 120,
                        height: 180,
                        borderRadius: 8,
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 48,
                        color: result.next_card ? getCardColor(result.next_card.suit) : 'text.primary',
                      }}
                    >
                      {result.next_card ? `${result.next_card.value}${result.next_card.suit}` : '?'}
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
                  Prediction: {prediction === 'High' ? 'Higher' : 'Lower'}
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

export default HighLowCard;
