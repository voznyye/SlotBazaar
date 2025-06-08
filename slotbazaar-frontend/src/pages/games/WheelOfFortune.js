import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import GameAnimations from '../../components/GameAnimations/GameAnimations';
import { AnimatePresence } from 'framer-motion';

const WheelOfFortune = () => {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const canvasRef = useRef(null);
  const wheelRef = useRef(null);

  const segments = [
    { value: 0, color: '#FF6B6B' },
    { value: 0, color: '#4ECDC4' },
    { value: 0, color: '#45B7D1' },
    { value: 0, color: '#96CEB4' },
    { value: 0, color: '#FFEEAD' },
    { value: 1.5, color: '#D4A5A5' },
    { value: 1.5, color: '#9B59B6' },
    { value: 1.5, color: '#3498DB' },
    { value: 2, color: '#E74C3C' },
    { value: 3, color: '#2ECC71' },
  ];

  useEffect(() => {
    drawWheel();
  }, []);

  const validateBet = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return 'Please enter a valid bet amount';
    }
    if (numValue > user.balance) {
      return 'Insufficient balance';
    }
    return null;
  };

  const handleBetChange = (e) => {
    const value = e.target.value;
    setBet(value);
    const error = validateBet(value);
    setError(error);
  };

  const handlePlay = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    const error = validateBet(bet);
    if (error) {
      toast.error(error);
      return;
    }

    setSpinning(true);
    setError(null);
    setShowAnimation(false);

    try {
      const response = await API.post('/games/wheel/play', {
        bet_amount: parseFloat(bet)
      });
      
      setResult(response.data);
      updateBalance(response.data.new_balance);
      
      // Show animation after a short delay
      setTimeout(() => {
        setShowAnimation(true);
      }, 500);

      if (response.data.net_win_loss >= 0) {
        toast.success(`You won $${response.data.winnings}!`);
      } else {
        toast.info('Better luck next time!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Game failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSpinning(false);
    }
  };

  const handlePlayAgain = () => {
    setBet('');
    setResult(null);
    setError(null);
    setShowAnimation(false);
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw segments
    const segmentAngle = (2 * Math.PI) / segments.length;
    segments.forEach((segment, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.stroke();

      // Draw segment value
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#000';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`${segment.value}x`, radius - 20, 5);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.stroke();
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Wheel of Fortune
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {result ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color={result.net_win_loss >= 0 ? 'success.main' : 'error.main'}>
                {result.net_win_loss >= 0 ? 'You Won!' : 'You Lost'}
              </Typography>
              <Typography variant="body1">
                Winning Segment: {result.winning_segment}
              </Typography>
              <Typography variant="body1">
                Winnings: ${result.winnings}
              </Typography>
              <Typography variant="body1">
                New Balance: ${result.new_balance}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePlayAgain}
                sx={{ mt: 2 }}
              >
                Play Again
              </Button>
            </Box>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handlePlay(); }}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Bet Amount"
                  type="number"
                  value={bet}
                  onChange={handleBetChange}
                  error={!!error}
                  helperText={error}
                  InputProps={{
                    inputProps: {
                      min: 1,
                      step: 1,
                    },
                  }}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ position: 'relative', mb: 3 }}>
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    style={{
                      width: '100%',
                      maxWidth: 400,
                      height: 'auto',
                      margin: '0 auto',
                      display: 'block',
                    }}
                  />
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={spinning || !!error}
                  sx={{ height: 48 }}
                >
                  {spinning ? <CircularProgress size={24} /> : 'Spin the Wheel'}
                </Button>
              </Box>
            </form>
          )}

          <AnimatePresence>
            {showAnimation && result && (
              <GameAnimations
                result={result.net_win_loss >= 0 ? 'win' : 'lose'}
                winnings={result.winnings}
                gameType="wheel"
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WheelOfFortune;
