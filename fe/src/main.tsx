import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { createRoot } from 'react-dom/client';
import App from './App';

const theme = createTheme({
  palette: { primary: { main: '#e85d04' }, background: { default: '#fffaf5' } },
  typography: { fontFamily: 'Inter, system-ui, sans-serif', h4: { fontWeight: 800 } },
  shape: { borderRadius: 12 },
});

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider>,
);
