import React, { useState, useRef, useEffect } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const WheelOfFortune = () => {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
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

  const drawWheel = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw segments
    segments.forEach((segment, index) => {
      const startAngle = (index * 2 * Math.PI) / segments.length;
      const endAngle = ((index + 1) * 2 * Math.PI) / segments.length;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + (Math.PI / segments.length));
      ctx.textAlign = 'right';
      ctx.fillStyle = '#000';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`${segment.value}x`, radius - 20, 0);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.stroke();
  };

  const handlePlay = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (parseFloat(bet) > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setSpinning(true);
    try {
      const response = await API.post('/games/wheel/play', {
        bet_amount: parseFloat(bet)
      });
      setResult(response.data);
      
      // Update balance with the new balance from the response
      if (response.data.new_balance !== undefined) {
        updateBalance(response.data.new_balance);
      }

      if (response.data.net_win_loss >= 0) {
        toast.success(`You won $${response.data.net_win_loss}!`);
      } else {
        toast.info('Better luck next time!');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to spin');
    } finally {
      setSpinning(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Wheel of Fortune
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
        </Box>
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
          onClick={handlePlay}
          disabled={spinning}
          sx={{ height: 48 }}
        >
          {spinning ? <CircularProgress size={24} /> : 'Spin the Wheel'}
        </Button>
        {result && !spinning && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Result
            </Typography>
            <Typography>
              Winning Segment: {result.winning_segment}
            </Typography>
            <Typography>
              Payout Rate: {result.payout_rate_on_win}x
            </Typography>
            <Typography>
              Winnings: ${result.winnings}
            </Typography>
            <Typography>
              Net Win/Loss: ${result.net_win_loss}
            </Typography>
            <Typography>
              New Balance: ${result.new_balance}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default WheelOfFortune;
