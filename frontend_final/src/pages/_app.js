// src/pages/_app.js
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme'; // adjust path if needed

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        preventDuplicate
        autoHideDuration={3000}
      >
        <Component {...pageProps} />
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default MyApp;