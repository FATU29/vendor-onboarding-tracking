import { IsInt, Max, Min } from 'class-validator';

export class UpdateStuckThresholdDto {
  /** Number of days a vendor may remain in a non-terminal stage. */
  @IsInt()
  @Min(1)
  @Max(365)
  thresholdDays!: number;
}
