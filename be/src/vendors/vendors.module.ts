import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { SettingsModule } from '../settings/settings.module';
import { UsersModule } from '../users/users.module';
import { RedisLockService } from './redis-lock.service';
import { TypeOrmVendorRepository } from './typeorm-vendor.repository';
import { VendorHistory } from './vendor-history.entity';
import { VENDOR_REPOSITORY } from './vendor.repository';
import { VendorStageEntity } from './vendor-stage.entity';
import { Vendor } from './vendor.entity';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

@Module({
  imports: [
    AuthModule,
    SettingsModule,
    UsersModule,
    TypeOrmModule.forFeature([Vendor, VendorHistory, VendorStageEntity]),
  ],
  controllers: [VendorsController],
  providers: [
    TypeOrmVendorRepository,
    { provide: VENDOR_REPOSITORY, useExisting: TypeOrmVendorRepository },
    VendorsService,
    RedisLockService,
  ],
})
export class VendorsModule {}
