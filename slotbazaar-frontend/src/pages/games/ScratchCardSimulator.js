import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const ScratchCardSimulator = () => {
  const { user, updateBalance } = useAuth();
  const [bet, setBet] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scratching, setScratching] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);

  const handlePlay = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (parseFloat(bet) > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    setRevealed(false);
    try {
      const response = await API.post('/games/scratch/play', {
        bet_amount: parseFloat(bet)
      });
      setResult(response.data);
      
      // Update balance with the new balance from the response
      if (response.data.new_balance !== undefined) {
        updateBalance(response.data.new_balance);
      }

      toast.success(response.data.result === 'win' ? 'You won!' : 'Better luck next time!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to play');
    } finally {
      setLoading(false);
    }
  };

  const initScratchCard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Fill with gray color
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, width, height);

    // Add scratch text
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch Here', width / 2, height / 2);

    setRevealed(false);
    setScratching(false);
  };

  const scratch = (e) => {
    if (!result || revealed) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');

    if (isDrawing.current) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.lineWidth = 30;
      ctx.lineCap = 'round';
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    lastPoint.current = { x, y };
    setScratching(true);

    // Check if enough is revealed
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let revealedPixels = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) revealedPixels++;
    }
    const revealedPercentage = (revealedPixels / (canvas.width * canvas.height)) * 100;

    if (revealedPercentage > 50) {
      setRevealed(true);
      toast.success(result.result === 'win' ? 'You won!' : 'Better luck next time!');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initScratchCard();
    }
  }, []);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Scratch Card
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
                position: 'relative',
                mb: 3,
                borderRadius: 2,
                overflow: 'hidden',
                border: '2px solid',
                borderColor: 'primary.main',
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  width: '100%',
                  height: 300,
                  touchAction: 'none',
                  cursor: 'pointer',
                }}
                onMouseDown={(e) => {
                  isDrawing.current = true;
                  scratch(e);
                }}
                onMouseMove={scratch}
                onMouseUp={() => (isDrawing.current = false)}
                onMouseLeave={() => (isDrawing.current = false)}
                onTouchStart={(e) => {
                  isDrawing.current = true;
                  scratch(e.touches[0]);
                }}
                onTouchMove={(e) => scratch(e.touches[0])}
                onTouchEnd={() => (isDrawing.current = false)}
              />
              {result && !revealed && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48,
                    color: 'primary.main',
                  }}
                >
                  {result.symbol}
                </Box>
              )}
            </Box>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handlePlay}
              disabled={loading}
              sx={{ height: 48 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Get New Card'}
            </Button>

            {result && revealed && (
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
                  Symbol: {result.symbol}
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

export default ScratchCardSimulator;
