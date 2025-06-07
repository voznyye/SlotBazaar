import React, { useState, useRef, useEffect } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';

const WheelOfFortune = () => {
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
      const endAngle = (index + 1) * segmentAngle;

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
      ctx.font = 'bold 20px Arial';
      ctx.fillText(segment.value.toString() + 'x', radius - 20, 5);
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
    setSpinning(true);
    try {
      const response = await API.post('/games/wheel/play', {
        bet_amount: parseFloat(bet)
      });
      setResult(response.data);

      // Animate wheel spin
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let rotation = 0;
      const targetRotation = 360 * 5 + (response.data.winning_segment * (360 / segments.length));
      const duration = 5000; // 5 seconds
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        rotation = targetRotation * progress;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        drawWheel();
        ctx.restore();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setSpinning(false);
          toast.success(`You ${response.data.net_win_loss >= 0 ? 'won' : 'lost'} ${Math.abs(response.data.net_win_loss)} coins!`);
        }
      };

      requestAnimationFrame(animate);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to spin');
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
              Winnings: {result.winnings}
            </Typography>
            <Typography>
              Net Win/Loss: {result.net_win_loss}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default WheelOfFortune;
