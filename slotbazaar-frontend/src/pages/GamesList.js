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

import coinFlipImage from '../assets/images/games/coinflip.png';
import diceRollImage from '../assets/images/games/dice.png';
import rouletteImage from '../assets/images/games/simpleroulette.png';
import blackjackImage from '../assets/images/games/blackjack.png';
import slotMachineImage from '../assets/images/games/slot.png';
import wheelImage from '../assets/images/games/wheel.png';
import highLowImage from '../assets/images/games/high.png';
import guessImage from '../assets/images/games/guess.png';
import rpsImage from '../assets/images/games/sps.png';

const games = [
  {
    id: 'highlow',
    title: 'High Low Card',
    description: 'Predict if the next card will be higher or lower',
    image: highLowImage,
    path: '/games/highlow',
  },
  {
    id: 'rps',
    title: 'Rock Paper Scissors',
    description: 'Classic game of Rock Paper Scissors',
    image: rpsImage,
    path: '/games/rps',
  },
  {
    id: 'blackjack',
    title: 'Blackjack',
    description: 'Try to beat the dealer',
    image: blackjackImage,
    path: '/games/blackjack',
  },
  {
    id: 'slot',
    title: 'Reel Slot',
    description: 'Spin the reels and win big',
    image: slotMachineImage,
    path: '/games/slot',
  },
  {
    id: 'coin',
    title: 'Coin Flip',
    description: 'Heads or tails?',
    image: coinFlipImage,
    path: '/games/coin',
  },
  {
    id: 'dice',
    title: 'Dice Roll',
    description: 'Roll the dice and test your luck',
    image: diceRollImage,
    path: '/games/dice',
  },
  {
    id: 'guess',
    title: 'Number Guess',
    description: 'Guess the number and win',
    image: guessImage,
    path: '/games/guess',
  },
  {
    id: 'roulette',
    title: 'Roulette',
    description: 'Place your bets on red or black',
    image: rouletteImage,
    path: '/games/roulette',
  },
  {
    id: 'wheel',
    title: 'Wheel of Fortune',
    description: 'Spin the wheel and win prizes',
    image: wheelImage,
    path: '/games/wheel',
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
