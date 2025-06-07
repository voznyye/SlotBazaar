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
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <NavBar />
        <Container
          maxWidth="lg"
          sx={{
            pt: { xs: 8, sm: 9 },
            pb: 4,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.5), transparent)',
            },
          }}
        >
          {children}
        </Container>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          style={{
            zIndex: 9999,
          }}
          toastStyle={{
            background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            color: '#ffffff',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
          }}
        />
      </Box>
    </ThemeProvider>
  );
};

export default Layout; 