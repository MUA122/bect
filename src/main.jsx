import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';
import './styles.css';

const TrialPage = lazy(() => import('./components/TrialPage'));

const theme = createTheme({
  palette: {
    primary: { main: '#00639a', dark: '#003f67', light: '#58b8de' },
    secondary: { main: '#f3c33b' },
    background: { default: '#f4f7f9', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"DM Sans", "Noto Kufi Arabic", Arial, sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 16 },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {window.location.pathname.replace(/\/+$/, '') === '/trial' ? (
        <Suspense fallback={<div style={{ minHeight: '100svh', background: '#06273b' }} />}>
          <TrialPage />
        </Suspense>
      ) : (
        <App />
      )}
    </ThemeProvider>
  </React.StrictMode>,
);
