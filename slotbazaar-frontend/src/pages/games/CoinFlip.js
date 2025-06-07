import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';

export default function CoinFlip() {
  const [bet, setBet] = useState('');
  const [choice, setChoice] = useState('heads');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePlay = async (e) => {
    e.preventDefault();
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/games/coin/flip', { bet, choice });
      setResult(response.data);
      toast.success(response.data.result === 'win' ? 'You won!' : 'Better luck next time!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Coin Flip
          </Typography>
          
          <form onSubmit={handlePlay}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Bet Amount"
                type="number"
                value={bet}
                onChange={(e) => setBet(e.target.value)}
                InputProps={{ inputProps: { min: 1 } }}
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth>
                <InputLabel>Choose Side</InputLabel>
                <Select
                  value={choice}
                  label="Choose Side"
                  onChange={(e) => setChoice(e.target.value)}
                >
                  <MenuItem value="heads">Heads</MenuItem>
                  <MenuItem value="tails">Tails</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              sx={{ height: 48 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Flip Coin'}
            </Button>
          </form>

          {result && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="h6" color={result.result === 'win' ? 'success.main' : 'error.main'}>
                {result.result === 'win' ? 'You Won!' : 'You Lost'}
              </Typography>
              <Typography variant="body1">
                Outcome: {result.outcome}
              </Typography>
              <Typography variant="body1">
                Winnings: {result.winnings}
              </Typography>
              <Typography variant="body1">
                New Balance: {result.new_balance}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
