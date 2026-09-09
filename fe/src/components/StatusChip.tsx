import { Chip } from '@mui/material';

const colors = ['default', 'warning', 'info', 'secondary', 'success'] as const;

type ChipColor = (typeof colors)[number];

/** Displays a configured stage while retaining a stable color by its numeric ID. */
export function StatusChip({ stageId, stageName }: { stageId: number; stageName: string }) {
  const color: ChipColor = colors[(stageId - 1) % colors.length];
  return <Chip label={stageName} color={color} size="small" />;
}
