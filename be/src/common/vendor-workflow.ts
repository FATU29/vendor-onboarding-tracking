export function isVendorStuck(
  stageEnteredAt: Date,
  thresholdDays: number,
  now = new Date(),
): boolean {
  const elapsedMilliseconds = now.getTime() - stageEnteredAt.getTime();
  return elapsedMilliseconds > thresholdDays * 24 * 60 * 60 * 1000;
}
