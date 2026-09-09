import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';
import { useVendorStore } from '../store/vendor-store';

export function LoginPage() {
  const coordinators = useVendorStore((state) => state.coordinators);
  const selectedName = useVendorStore((state) => state.selectedName);
  const error = useVendorStore((state) => state.error);
  const setSelectedName = useVendorStore((state) => state.setSelectedName);
  const login = useVendorStore((state) => state.login);

  return (
    <Box minHeight="100vh" display="grid" sx={{ placeItems: 'center', p: 2 }}>
      <Paper elevation={3} sx={{ p: 4, width: 'min(440px, 100%)' }}>
        <Typography variant="h4" gutterBottom>Vendor Onboarding</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Chọn tài khoản điều phối viên để bắt đầu theo dõi vendor.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <FormControl fullWidth>
          <InputLabel id="coordinator-label">Điều phối viên</InputLabel>
          <Select
            labelId="coordinator-label"
            label="Điều phối viên"
            value={selectedName}
            onChange={(event) => setSelectedName(event.target.value)}
          >
            {coordinators.map((coordinator) => (
              <MenuItem key={coordinator.id} value={coordinator.name}>{coordinator.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button sx={{ mt: 3 }} fullWidth variant="contained" disabled={!selectedName} onClick={() => void login()}>
          Đăng nhập
        </Button>
      </Paper>
    </Box>
  );
}
