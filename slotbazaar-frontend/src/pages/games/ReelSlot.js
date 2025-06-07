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
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import API from '../../api';

const SYMBOLS = ['🍒', '🍊', '🍋', '🍇', '💎', '7️⃣'];
const REELS = 3;

const ReelSlot = () => {
  const [bet, setBet] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const handlePlay = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    setLoading(true);
    setSpinning(true);
    try {
      const response = await API.post('/games/slot/play', { bet });
      setResult(response.data);
      toast.success(response.data.result === 'win' ? 'You won!' : 'Better luck next time!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setTimeout(() => setSpinning(false), 2000);
    }
  };

  const reelVariants = {
    spinning: {
      y: [0, -1000],
      transition: {
        duration: 2,
        ease: "easeInOut",
      }
    },
    static: {
      y: 0,
    }
  };

  const getSymbols = (reelIndex) => {
    if (!result) return SYMBOLS;
    return result.symbols[reelIndex] ? [result.symbols[reelIndex]] : SYMBOLS;
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Slot Machine
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

            <Box
              sx={{
                bgcolor: 'background.paper',
                p: 3,
                borderRadius: 2,
                mb: 3,
                overflow: 'hidden',
              }}
            >
              <Grid container spacing={2}>
                {Array.from({ length: REELS }).map((_, index) => (
                  <Grid item xs={4} key={index}>
                    <Box
                      sx={{
                        height: 200,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={spinning ? 'spinning' : 'static'}
                          variants={reelVariants}
                          initial="static"
                          animate={spinning ? 'spinning' : 'static'}
                          style={{
                            position: 'absolute',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}
                        >
                          {getSymbols(index).map((symbol, i) => (
                            <Box
                              key={i}
                              sx={{
                                height: 200,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 64,
                              }}
                            >
                              {symbol}
                            </Box>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handlePlay}
              disabled={loading}
              sx={{ height: 48 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Spin'}
            </Button>

            {result && (
              <Box
                sx={{
                  mt: 3,
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
                  Symbols: {result.symbols.join(' ')}
                </Typography>
                <Typography variant="body1">
                  Winnings: {result.winnings}
                </Typography>
                <Typography variant="body1">
                  New Balance: {result.new_balance}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReelSlot;
