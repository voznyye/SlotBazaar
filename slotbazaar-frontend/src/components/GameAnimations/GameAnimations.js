import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography } from '@mui/material';

const confettiVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 1],
    transition: {
      duration: 0.5,
      times: [0, 0.6, 1],
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const particleVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1, 0],
    opacity: [0, 1, 0],
    y: [0, -100],
    x: [0, Math.random() * 100 - 50],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

const coinVariants = {
  initial: { scale: 0, opacity: 0, y: 0 },
  animate: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 1],
    y: [0, -20, 0],
    rotate: [0, 360],
    transition: {
      duration: 0.8,
      times: [0, 0.6, 1],
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const jackpotVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.5, 1],
    opacity: [0, 1, 1],
    transition: {
      duration: 0.8,
      times: [0, 0.6, 1],
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const loseVariants = {
  initial: { scale: 0, opacity: 0, rotate: 0 },
  animate: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 1],
    rotate: [0, -10, 10, -10, 0],
    transition: {
      duration: 0.8,
      times: [0, 0.3, 0.5, 0.7, 1],
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const GameAnimations = ({ result, winnings, gameType }) => {
  const isWin = result === 'win';
  const isJackpot = winnings && winnings >= 1000; // Define jackpot threshold

  const getAnimationType = () => {
    if (!isWin) return 'lose';
    if (isJackpot) return 'jackpot';
    if (gameType === 'slots') return 'slots';
    if (gameType === 'roulette') return 'roulette';
    if (gameType === 'blackjack') return 'blackjack';
    return 'default';
  };

  const animationType = getAnimationType();

  const renderWinAnimation = () => {
    switch (animationType) {
      case 'jackpot':
        return (
          <>
            <motion.div
              variants={jackpotVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  color: '#FFD700',
                  textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
                  fontWeight: 'bold',
                  fontSize: '4rem',
                }}
              >
                JACKPOT!
              </Typography>
            </motion.div>
            {/* Gold coins animation */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                variants={coinVariants}
                initial="initial"
                animate="animate"
                style={{
                  position: 'absolute',
                  width: 30,
                  height: 30,
                  backgroundColor: '#FFD700',
                  borderRadius: '50%',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
                }}
              />
            ))}
          </>
        );

      case 'slots':
        return (
          <>
            <motion.div
              variants={confettiVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: '#00ff00',
                  textShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
                  fontWeight: 'bold',
                }}
              >
                WIN!
              </Typography>
            </motion.div>
            {/* Slot machine specific particles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                variants={particleVariants}
                initial="initial"
                animate="animate"
                style={{
                  position: 'absolute',
                  width: 15,
                  height: 15,
                  backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][i % 5],
                  borderRadius: '50%',
                  top: '50%',
                  left: '50%',
                }}
              />
            ))}
          </>
        );

      case 'roulette':
        return (
          <>
            <motion.div
              variants={confettiVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: '#4CAF50',
                  textShadow: '0 0 20px rgba(76, 175, 80, 0.5)',
                  fontWeight: 'bold',
                }}
              >
                WIN!
              </Typography>
            </motion.div>
            {/* Roulette specific particles */}
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                variants={particleVariants}
                initial="initial"
                animate="animate"
                style={{
                  position: 'absolute',
                  width: 12,
                  height: 12,
                  backgroundColor: '#4CAF50',
                  borderRadius: '50%',
                  top: '50%',
                  left: '50%',
                }}
              />
            ))}
          </>
        );

      case 'blackjack':
        return (
          <>
            <motion.div
              variants={confettiVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: '#2196F3',
                  textShadow: '0 0 20px rgba(33, 150, 243, 0.5)',
                  fontWeight: 'bold',
                }}
              >
                WIN!
              </Typography>
            </motion.div>
            {/* Blackjack specific particles */}
            {[...Array(35)].map((_, i) => (
              <motion.div
                key={i}
                variants={particleVariants}
                initial="initial"
                animate="animate"
                style={{
                  position: 'absolute',
                  width: 14,
                  height: 14,
                  backgroundColor: '#2196F3',
                  borderRadius: '50%',
                  top: '50%',
                  left: '50%',
                }}
              />
            ))}
          </>
        );

      default:
        return (
          <>
            <motion.div
              variants={confettiVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: '#00ff00',
                  textShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
                  fontWeight: 'bold',
                }}
              >
                WIN!
              </Typography>
            </motion.div>
            {/* Default particles */}
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                variants={particleVariants}
                initial="initial"
                animate="animate"
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][i % 5],
                  borderRadius: '50%',
                  top: '50%',
                  left: '50%',
                }}
              />
            ))}
          </>
        );
    }
  };

  return (
    <AnimatePresence>
      {result && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {isWin ? (
            renderWinAnimation()
          ) : (
            <motion.div
              variants={loseVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: '#ff0000',
                  textShadow: '0 0 20px rgba(255, 0, 0, 0.5)',
                  fontWeight: 'bold',
                }}
              >
                LOSE
              </Typography>
            </motion.div>
          )}
        </Box>
      )}
    </AnimatePresence>
  );
};

export default GameAnimations; 