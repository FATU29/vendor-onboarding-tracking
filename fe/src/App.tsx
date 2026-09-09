import { Box, CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { LoginPage } from './components/LoginPage';
import { useVendorStore } from './store/vendor-store';

export default function App() {
  const loading = useVendorStore((state) => state.loading);
  const currentUser = useVendorStore((state) => state.currentUser);
  const load = useVendorStore((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <Box minHeight="100vh" display="grid" sx={{ placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return currentUser ? <Dashboard /> : <LoginPage />;
}
