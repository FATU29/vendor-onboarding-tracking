import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateVendorStageDto {
  /** Numeric ID from GET /api/vendors/stages. */
  @IsInt()
  @Min(1)
  stageId!: number;

  @IsInt()
  @Min(1)
  version!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
