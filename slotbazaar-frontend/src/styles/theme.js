import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ffff',
      light: '#33ffff',
      dark: '#00cccc',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ff00ff',
      light: '#ff33ff',
      dark: '#cc00cc',
      contrastText: '#000000',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    success: {
      main: '#00ff00',
      light: '#33ff33',
      dark: '#00cc00',
      contrastText: '#000000',
    },
    error: {
      main: '#ff0000',
      light: '#ff3333',
      dark: '#cc0000',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ffff00',
      light: '#ffff33',
      dark: '#cccc00',
      contrastText: '#000000',
    },
    info: {
      main: '#00ffff',
      light: '#33ffff',
      dark: '#00cccc',
      contrastText: '#000000',
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
    },
    h2: {
      fontWeight: 700,
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
    },
    h3: {
      fontWeight: 700,
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
    },
    h4: {
      fontWeight: 700,
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
    },
    h5: {
      fontWeight: 700,
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
    },
    h6: {
      fontWeight: 700,
      textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)',
          '&:hover': {
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #00ffff, #0066ff)',
          '&:hover': {
            background: 'linear-gradient(45deg, #00cccc, #0055cc)',
          },
        },
        outlined: {
          borderColor: '#00ffff',
          color: '#00ffff',
          '&:hover': {
            borderColor: '#00ffff',
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
          },
        },
        text: {
          color: '#00ffff',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
          border: '1px solid rgba(0, 255, 255, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: '#00ffff',
            '& fieldset': {
              borderColor: 'rgba(0, 255, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 255, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00ffff',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(0, 255, 255, 0.7)',
          },
          '& .MuiFormHelperText-root': {
            color: '#ff4444',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: '#00ffff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 255, 255, 0.3)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 255, 255, 0.5)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#00ffff',
          },
          '& .MuiSvgIcon-root': {
            color: '#00ffff',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#00ffff',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 255, 255, 0.2)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          '& .MuiAlert-icon': {
            color: '#00ffff',
          },
        },
        standardSuccess: {
          backgroundColor: 'rgba(0, 255, 0, 0.1)',
          border: '1px solid rgba(0, 255, 0, 0.3)',
          color: '#00ff00',
        },
        standardError: {
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          border: '1px solid rgba(255, 0, 0, 0.3)',
          color: '#ff4444',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 255, 0, 0.1)',
          border: '1px solid rgba(255, 255, 0, 0.3)',
          color: '#ffff00',
        },
        standardInfo: {
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          color: '#00ffff',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          color: '#00ffff',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 255, 0.2)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 255, 255, 0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme; 