import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

interface StuckThresholdConfigProps {
  thresholdDays: number;
  saving: boolean;
  onSave: (thresholdDays: number) => Promise<void>;
}

export function StuckThresholdConfig({
  thresholdDays,
  saving,
  onSave,
}: StuckThresholdConfigProps) {
  const [value, setValue] = useState(String(thresholdDays));

  useEffect(() => setValue(String(thresholdDays)), [thresholdDays]);

  const parsedValue = Number(value);
  const isValid = Number.isInteger(parsedValue) && parsedValue >= 1 && parsedValue <= 365;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={2}>
        <SettingsOutlinedIcon color="primary" />
        <Stack sx={{ flexGrow: 1 }}>
          <Typography fontWeight={600}>Cấu hình vendor quá hạn</Typography>
          <Typography variant="body2" color="text.secondary">
            Vendor ở một stage chưa hoàn tất quá số ngày này sẽ được đánh dấu `Overdue`.
          </Typography>
        </Stack>
        <TextField
          label="Số ngày"
          type="number"
          size="small"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          slotProps={{ htmlInput: { min: 1, max: 365, step: 1 } }}
          error={value !== '' && !isValid}
          helperText={value !== '' && !isValid ? 'Nhập từ 1 đến 365' : undefined}
          sx={{ width: 150 }}
        />
        <Button
          variant="contained"
          disabled={!isValid || saving || parsedValue === thresholdDays}
          onClick={() => void onSave(parsedValue)}
        >
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </Button>
      </Stack>
    </Paper>
  );
}
