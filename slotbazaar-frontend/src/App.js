import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Balance from './pages/Balance';
import Transactions from './pages/Transactions';
import PrivateRoute from './components/PrivateRoute';
import NavBar from './components/NavBar';

import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import GamesList from './pages/GamesList';

import CoinFlip from './pages/games/CoinFlip';
import DiceRoll from './pages/games/DiceRoll';
import HighLowCard from './pages/games/HighLowCard';
import NumberGuess from './pages/games/NumberGuess';
import ReelSlot from './pages/games/ReelSlot';
import RockPaperScissors from './pages/games/RockPaperScissors';
import ScratchCardSimulator from './pages/games/ScratchCardSimulator';
import SimpleRoulette from './pages/games/SimpleRoulette';
import SimplifiedBlackjack from './pages/games/SimplifiedBlackjack';
import Terms from './pages/Terms';
import MarkdownPage from './components/MarkdownPage';

function App() {
  return (
    <Layout>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/faq" element={<MarkdownPage file="faq" />} />
        <Route path="/privacy" element={<MarkdownPage file="privacy" />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/balance"
          element={
            <PrivateRoute>
              <Balance />
            </PrivateRoute>
          }
        />
        <Route
          path="/deposit"
          element={
            <PrivateRoute>
              <Deposit />
            </PrivateRoute>
          }
        />
        <Route
          path="/withdraw"
          element={
            <PrivateRoute>
              <Withdraw />
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          }
        />
        <Route
          path="/games"
          element={
            <PrivateRoute>
              <GamesList />
            </PrivateRoute>
          }
        />

        <Route
          path="/games/coinflip"
          element={
            <PrivateRoute>
              <CoinFlip />
            </PrivateRoute>
          }
        />
        <Route
          path="/games/diceroll"
          element={
            <PrivateRoute>
              <DiceRoll />
            </PrivateRoute>
          }
        />
        <Route
          path="/games/highlowcard"
          element={
            <PrivateRoute>
              <HighLowCard />
            </PrivateRoute>
          }
        />
        <Route
          path="/games/numberguess"
          element={
            <PrivateRoute>
              <NumberGuess />
            </PrivateRoute>
          }
        />
        <Route
          path="/games/reelslot"
          element={
            <PrivateRoute>
              <ReelSlot />
            </PrivateRoute>
          }
        />
        <Route
          path="/games/rockpaperscissors"
          element={
            <PrivateRoute>
              <RockPaperScissors />
            </PrivateRoute>
          }
        />
        <Route
          path="/games/scratchcard"
          element={
            <PrivateRoute>
              <ScratchCardSimulator />
            </PrivateRoute>
          }
        />
        <Route
          path="/games/simpleroulette"
          element={
            <PrivateRoute>
              <SimpleRoulette />
            </PrivateRoute>
          }
        />
        <Route
          path="/games/blackjack"
          element={
            <PrivateRoute>
              <SimplifiedBlackjack />
            </PrivateRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
