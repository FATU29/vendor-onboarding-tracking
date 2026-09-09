import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
  Alert, AppBar, Box, Button, Container, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { useVendorStore } from '../store/vendor-store';
import { StatusChip } from './StatusChip';
import { StuckThresholdConfig } from './StuckThresholdConfig';
import { VendorDialogs } from './VendorDialogs';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function Dashboard() {
  const currentUser = useVendorStore((state) => state.currentUser);
  const vendors = useVendorStore((state) => state.vendors);
  const stuckThresholdDays = useVendorStore((state) => state.stuckThresholdDays);
  const savingThreshold = useVendorStore((state) => state.savingThreshold);
  const error = useVendorStore((state) => state.error);
  const logout = useVendorStore((state) => state.logout);
  const clearError = useVendorStore((state) => state.clearError);
  const openEditor = useVendorStore((state) => state.openEditor);
  const openHistory = useVendorStore((state) => state.openHistory);
  const saveStuckThreshold = useVendorStore((state) => state.saveStuckThreshold);
  const stuckCount = useMemo(
    () => vendors.filter((vendor) => vendor.isStuck).length,
    [vendors],
  );

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Vendor Onboarding Tracker</Typography>
          <Typography variant="body2">Điều phối viên: <strong>{currentUser?.name}</strong></Typography>
          <Button color="inherit" sx={{ ml: 2 }} onClick={logout}>Đăng xuất</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4">Danh sách vendor</Typography>
            <Typography color="text.secondary">Tự động đánh dấu vendor đứng yên quá ngưỡng ngày được cấu hình.</Typography>
          </Box>
          <Alert icon={<WarningAmberOutlinedIcon />} severity={stuckCount ? 'warning' : 'success'}>
            {stuckCount ? `${stuckCount} vendor đang bị kẹt.` : 'Không có vendor bị kẹt.'}
          </Alert>
        </Stack>
        {error && <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>{error}</Alert>}
        <StuckThresholdConfig
          thresholdDays={stuckThresholdDays}
          saving={savingThreshold}
          onSave={saveStuckThreshold}
        />
        <TableContainer component={Paper} variant="outlined">
          <Table aria-label="Danh sách vendor">
            <TableHead><TableRow>
              <TableCell>Vendor</TableCell><TableCell>Khu vực</TableCell><TableCell>Trạng thái</TableCell>
              <TableCell>Thời gian ở stage</TableCell><TableCell>Vào trạng thái lúc</TableCell>
              <TableCell>Cập nhật gần nhất</TableCell><TableCell>Ghi chú</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id} sx={vendor.isStuck ? { bgcolor: 'warning.50' } : undefined}>
                  <TableCell><Stack direction="row" alignItems="center" spacing={1}>
                    <strong>{vendor.name}</strong>
                    {vendor.isStuck && <WarningAmberOutlinedIcon color="warning" fontSize="small" titleAccess="Bị kẹt" />}
                  </Stack></TableCell>
                  <TableCell>{vendor.region}</TableCell>
                  <TableCell><StatusChip stageId={vendor.stageId} stageName={vendor.stage} /></TableCell>
                  <TableCell>
                    <Typography variant="body2">{vendor.daysInStage} ngày</Typography>
                    {!vendor.isTerminal && vendor.isStuck && (
                      <Typography variant="caption" color="warning.main" fontWeight={600}>
                        Quá hạn {vendor.overdueDays} ngày
                      </Typography>
                    )}
                    {!vendor.isTerminal && !vendor.isStuck && (
                      <Typography variant="caption" color="text.secondary">
                        Còn {Math.max(0, stuckThresholdDays - vendor.daysInStage)} ngày
                      </Typography>
                    )}
                    {vendor.isTerminal && (
                      <Typography variant="caption" color="success.main">Stage hoàn tất</Typography>
                    )}
                  </TableCell>
                  <TableCell>{dateFormatter.format(new Date(vendor.stageEnteredAt))}</TableCell>
                  <TableCell>{vendor.lastUpdatedByName ?? '—'}</TableCell>
                  <TableCell>{vendor.notes ?? '—'}</TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => openEditor(vendor)}>Cập nhật</Button>
                    <Button size="small" startIcon={<HistoryOutlinedIcon />} onClick={() => void openHistory(vendor)}>Lịch sử</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
      <VendorDialogs />
    </>
  );
}
