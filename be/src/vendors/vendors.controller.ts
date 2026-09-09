import { Body, Controller, Get, Headers, Param, Patch } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UpdateStuckThresholdDto } from './update-stuck-threshold.dto';
import { UpdateVendorStageDto } from './update-vendor-stage.dto';
import { VendorsService } from './vendors.service';

@Controller('vendors')
export class VendorsController {
  constructor(
    private readonly vendorsService: VendorsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  findAll() {
    return this.vendorsService.findAll();
  }

  @Get('stages')
  findStages() {
    return this.vendorsService.findStages();
  }

  @Get('stuck-threshold')
  findStuckThreshold() {
    return this.vendorsService.findStuckThreshold();
  }

  @Patch('stuck-threshold')
  updateStuckThreshold(
    @Body() dto: UpdateStuckThresholdDto,
    @Headers('authorization') authorization?: string,
  ) {
    const token = authorization?.replace(/^Bearer\s+/i, '');
    this.authService.getUser(token);
    return this.vendorsService.updateStuckThreshold(dto);
  }

  @Get(':id/history')
  findHistory(@Param('id') id: string) {
    return this.vendorsService.findHistory(id);
  }

  @Patch(':id/stage')
  updateStage(
    @Param('id') id: string,
    @Body() dto: UpdateVendorStageDto,
    @Headers('authorization') authorization?: string,
  ) {
    const token = authorization?.replace(/^Bearer\s+/i, '');
    const user = this.authService.getUser(token);
    return this.vendorsService.updateStage(id, dto, user.id);
  }
}
