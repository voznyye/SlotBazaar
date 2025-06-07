import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import {
  AccountBalance,
  Casino,
  History,
  TrendingUp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

// Import game images
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
    id: 'coin',
    name: 'Coin Flip',
    description: 'Classic heads or tails game with a 96% RTP',
    image: coinFlipImage,
    path: '/games/coin',
  },
  {
    id: 'dice',
    name: 'Dice Roll',
    description: 'Roll the dice and win big!',
    image: diceRollImage,
    path: '/games/dice',
  },
  {
    id: 'roulette',
    name: 'Roulette',
    description: 'European-style roulette with multiple betting options',
    image: rouletteImage,
    path: '/games/roulette',
  },
  {
    id: 'blackjack',
    name: 'Blackjack',
    description: 'Classic card game with perfect strategy',
    image: blackjackImage,
    path: '/games/blackjack',
  },
  {
    id: 'slot',
    name: 'Slot Machine',
    description: 'Try your luck with our modern slot machine',
    image: slotMachineImage,
    path: '/games/slot',
  },
  {
    id: 'wheel',
    name: 'Wheel of Fortune',
    description: 'Spin the wheel and win amazing prizes',
    image: wheelImage,
    path: '/games/wheel',
  },
  {
    id: 'highlow',
    name: 'High Low Card',
    description: 'Guess if the next card will be higher or lower',
    image: highLowImage,
    path: '/games/highlow',
  },
  {
    id: 'guess',
    name: 'Number Guess',
    description: 'Try to guess the number and win big!',
    image: guessImage,
    path: '/games/guess',
  },
  {
    id: 'rps',
    name: 'Rock Paper Scissors',
    description: 'Classic game of Rock Paper Scissors',
    image: rpsImage,
    path: '/games/rps',
  },
];

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = [
    {
      title: 'Balance',
      value: `$${parseFloat(user?.balance || 0).toFixed(2)}`,
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Games Played',
      value: user?.gamesPlayed || 0,
      icon: <Casino sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Win Rate',
      value: `${user?.winRate || 0}%`,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
    },
    {
      title: 'Total Winnings',
      value: `$${parseFloat(user?.totalWinnings || 0).toFixed(2)}`,
      icon: <History sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Stats Section */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      color: stat.color,
                      mr: 1,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography
                    component="h2"
                    variant="h6"
                    color="text.primary"
                    gutterBottom
                  >
                    {stat.title}
                  </Typography>
                </Box>
                <Typography component="p" variant="h4">
                  {stat.value}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}

        {/* Games Section */}
        <Grid item xs={12}>
          <Typography
            variant="h4"
            sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold' }}
          >
            Featured Games
          </Typography>
        </Grid>
        {games.map((game, index) => (
          <Grid item xs={12} sm={6} md={4} key={game.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="340"
                  image={game.image}
                  alt={game.name}
                  sx={{
                    objectFit: 'cover',
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {game.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {game.description}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(game.path)}
                    sx={{
                      backgroundColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;
