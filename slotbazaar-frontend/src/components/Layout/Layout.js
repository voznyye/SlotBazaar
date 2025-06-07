import React from 'react';
import { Box, Container, CssBaseline, ThemeProvider } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import theme from '../../styles/theme';
import NavBar from '../NavBar';

const Layout = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <NavBar />
        <Container
          component="main"
          maxWidth="lg"
          sx={{
            flex: 1,
            py: 4,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Container>
      </Box>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ThemeProvider>
  );
};

export default Layout; 