/**
 * Material Design 3 Theme - Lớp Học Tích Cực
 */
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6750A4',
      light: '#D0BCFF',
      dark: '#4F378B',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6D00',
      light: '#FFE0B2',
      dark: '#E65100',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAF9F6',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1B1F',
      secondary: '#49454F',
    },
    error: {
      main: '#B3261E',
    },
    success: {
      main: '#2E7D32',
    },
  },
  typography: {
    fontFamily: '"Open Sans", sans-serif',
    h1: { fontFamily: '"Roboto", sans-serif' },
    h2: { fontFamily: '"Roboto", sans-serif' },
    h3: { fontFamily: '"Roboto", sans-serif' },
    h4: { fontFamily: '"Roboto", sans-serif' },
    h5: { fontFamily: '"Roboto", sans-serif' },
    h6: { fontFamily: '"Roboto", sans-serif' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.3s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
