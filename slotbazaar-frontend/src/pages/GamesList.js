import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';

const games = [
  {
    id: 'coinflip',
    title: 'Coin Flip',
    description: 'Classic heads or tails game with instant results',
    image: '/images/games/coinflip.jpg',
    path: '/games/coinflip',
  },
  {
    id: 'diceroll',
    title: 'Dice Roll',
    description: 'Roll the dice and test your luck',
    image: '/images/games/dice.jpg',
    path: '/games/diceroll',
  },
  {
    id: 'highlowcard',
    title: 'High Low Card',
    description: 'Predict if the next card will be higher or lower',
    image: '/images/games/cards.jpg',
    path: '/games/highlowcard',
  },
  {
    id: 'numberguess',
    title: 'Number Guess',
    description: 'Try to guess the number and win big',
    image: '/images/games/numbers.jpg',
    path: '/games/numberguess',
  },
  {
    id: 'reelslot',
    title: 'Reel Slot',
    description: 'Classic slot machine with multiple paylines',
    image: '/images/games/slot.jpg',
    path: '/games/reelslot',
  },
  {
    id: 'rockpaperscissors',
    title: 'Rock Paper Scissors',
    description: 'Play the classic game with a twist',
    image: '/images/games/rps.jpg',
    path: '/games/rockpaperscissors',
  },
  {
    id: 'scratchcard',
    title: 'Scratch Card',
    description: 'Reveal symbols and win instant prizes',
    image: '/images/games/scratch.jpg',
    path: '/games/scratchcard',
  },
  {
    id: 'simpleroulette',
    title: 'Simple Roulette',
    description: 'Place your bets on numbers and colors',
    image: '/images/games/roulette.jpg',
    path: '/games/simpleroulette',
  },
  {
    id: 'blackjack',
    title: 'Blackjack',
    description: 'Classic card game against the dealer',
    image: '/images/games/blackjack.jpg',
    path: '/games/blackjack',
  },
];

const MotionCard = motion(Card);

const GamesList = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Choose Your Game
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ mb: 6 }}>
          Select from our wide variety of exciting games
        </Typography>

        <Grid container spacing={3}>
          {games.map((game, index) => (
            <Grid item xs={12} sm={6} md={4} key={game.id}>
              <MotionCard
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(game.path)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={game.image}
                  alt={game.title}
                  sx={{
                    objectFit: 'cover',
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {game.title}
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    {game.description}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(game.path);
                    }}
                  >
                    Play Now
                  </Button>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default GamesList;
