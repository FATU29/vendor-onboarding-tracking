import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import { useVendorStore } from '../store/vendor-store';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });

export function VendorDialogs() {
  const store = useVendorStore();

  return (
    <>
      <Dialog open={Boolean(store.editing)} onClose={store.closeEditor} fullWidth maxWidth="sm">
        <DialogTitle>Cập nhật {store.editing?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="stage-label">Trạng thái</InputLabel>
              <Select labelId="stage-label" label="Trạng thái" value={store.stageId} onChange={(event) => store.setStageId(Number(event.target.value))}>
                {store.stages.map((stage) => <MenuItem key={stage.id} value={stage.id}>{stage.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Ghi chú" value={store.notes} onChange={(event) => store.setNotes(event.target.value)} multiline minRows={3} inputProps={{ maxLength: 500 }} helperText={`${store.notes.length}/500`} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={store.saving} onClick={store.closeEditor}>Hủy</Button>
          <Button variant="contained" disabled={store.saving || !store.stageId} onClick={() => void store.saveStage()}>
            {store.saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(store.historyVendor)} onClose={store.closeHistory} fullWidth maxWidth="sm">
        <DialogTitle>Lịch sử: {store.historyVendor?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {store.history.map((item) => (
              <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={700}>{item.previousStage ?? 'Khởi tạo'} → {item.nextStage}</Typography>
                <Typography variant="body2" color="text.secondary">{item.changedByName} · {dateFormatter.format(new Date(item.changedAt))}</Typography>
              </Paper>
            ))}
            {store.history.length === 0 && <Typography color="text.secondary">Chưa có lịch sử.</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={store.closeHistory}>Đóng</Button></DialogActions>
      </Dialog>
    </>
  );
}
