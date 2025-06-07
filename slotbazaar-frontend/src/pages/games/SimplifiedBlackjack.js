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
  Paper,
} from '@mui/material';
import { toast } from 'react-toastify';
import API from '../../api';

const SimplifiedBlackjack = () => {
  const [bet, setBet] = useState('');
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const startGame = async () => {
    if (!bet || bet <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/games/blackjack/start', { bet });
      setGameState(response.data);
      setGameOver(false);
      toast.success('Game started!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const hit = async () => {
    setLoading(true);
    try {
      const response = await API.post('/games/blackjack/hit');
      setGameState(response.data);
      if (response.data.game_over) {
        setGameOver(true);
        toast.info('Game Over!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const stand = async () => {
    setLoading(true);
    try {
      const response = await API.post('/games/blackjack/stand');
      setGameState(response.data);
      setGameOver(true);
      toast.info('Game Over!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderCard = (card) => {
    const colors = {
      hearts: 'red',
      diamonds: 'red',
      clubs: 'black',
      spades: 'black',
    };

    return (
      <Paper
        elevation={3}
        sx={{
          width: 80,
          height: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'white',
          color: colors[card.suit],
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 2,
          p: 1,
          m: 0.5,
        }}
      >
        <Typography variant="h6">{card.value}</Typography>
        <Typography variant="h4">{getSuitSymbol(card.suit)}</Typography>
      </Paper>
    );
  };

  const getSuitSymbol = (suit) => {
    const symbols = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠',
    };
    return symbols[suit];
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Simplified Blackjack
          </Typography>

          <Box sx={{ mb: 4 }}>
            {!gameState && (
              <TextField
                fullWidth
                label="Bet Amount"
                type="number"
                value={bet}
                onChange={(e) => setBet(e.target.value)}
                InputProps={{ inputProps: { min: 1 } }}
                sx={{ mb: 3 }}
              />
            )}

            {!gameState && (
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={startGame}
                disabled={loading}
                sx={{ height: 48, mb: 3 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Start Game'}
              </Button>
            )}

            {gameState && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Dealer's Hand ({gameState.dealer_score})
                  </Typography>
                  <Grid container spacing={1}>
                    {gameState.dealer_cards.map((card, index) => (
                      <Grid item key={index}>
                        {renderCard(card)}
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Your Hand ({gameState.player_score})
                  </Typography>
                  <Grid container spacing={1}>
                    {gameState.player_cards.map((card, index) => (
                      <Grid item key={index}>
                        {renderCard(card)}
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {!gameOver && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={hit}
                        disabled={loading}
                        sx={{ height: 48 }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Hit'}
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        onClick={stand}
                        disabled={loading}
                        sx={{ height: 48 }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Stand'}
                      </Button>
                    </Grid>
                  </Grid>
                )}

                {gameOver && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: gameState.result === 'win' ? 'success.light' : 'error.light',
                      color: 'white',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h6">
                      {gameState.result === 'win' ? 'You Won!' : 'You Lost'}
                    </Typography>
                    <Typography variant="body1">
                      Winnings: {gameState.winnings}
                    </Typography>
                    <Typography variant="body1">
                      New Balance: {gameState.new_balance}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setGameState(null)}
                      sx={{ mt: 2 }}
                    >
                      Play Again
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SimplifiedBlackjack;
