import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Grid,
  Paper,
} from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';

const WheelOfFortune = () => {
  const [bet, setBet] = useState('');
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const canvasRef = useRef(null);
  const wheelRef = useRef(null);

  const segments = [
    { value: 2, color: '#FF6B6B' },
    { value: 3, color: '#4ECDC4' },
    { value: 4, color: '#45B7D1' },
    { value: 5, color: '#96CEB4' },
    { value: 6, color: '#FFEEAD' },
    { value: 7, color: '#D4A5A5' },
    { value: 8, color: '#9B59B6' },
    { value: 9, color: '#3498DB' },
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
      ctx.fillText(segment.value.toString(), radius - 20, 5);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.stroke();
  };

  const spinWheel = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (selectedSegment === null) {
      toast.error('Please select a segment');
      return;
    }

    setLoading(true);
    setSpinning(true);

    try {
      const response = await API.post('/games/wheel/play', {
        bet,
        segment: selectedSegment,
      });
      setResult(response.data);

      // Animate wheel spin
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let rotation = 0;
      const targetRotation = 360 * 5 + Math.random() * 360; // 5 full rotations + random
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
          toast.success('Spin complete!');
        }
      };

      requestAnimationFrame(animate);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
      setSpinning(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Wheel of Fortune
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
              {segments.map((segment) => (
                <Grid item key={segment.value}>
                  <Paper
                    elevation={3}
                    sx={{
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: selectedSegment === segment.value ? 'primary.main' : segment.color,
                      color: 'white',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                    onClick={() => setSelectedSegment(segment.value)}
                  >
                    <Typography variant="h6">{segment.value}x</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

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
              onClick={spinWheel}
              disabled={loading || spinning}
              sx={{ height: 48 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Spin'}
            </Button>

            {result && !spinning && (
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
                  Winning Segment: {result.winning_segment}x
                </Typography>
                <Typography variant="body1">
                  Your Segment: {result.your_segment}x
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

export default WheelOfFortune;
