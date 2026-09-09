import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import appDataSource from './database/data-source';
import { HealthModule } from './health/health.module';
import { AppSetting } from './settings/app-setting.entity';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { VendorHistory } from './vendors/vendor-history.entity';
import { VendorStageEntity } from './vendors/vendor-stage.entity';
import { Vendor } from './vendors/vendor.entity';
import { VendorsModule } from './vendors/vendors.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'vendor_tracker',
      entities: [AppSetting, User, Vendor, VendorHistory, VendorStageEntity],
      migrations: appDataSource.options.migrations,
      migrationsTableName: 'typeorm_migrations',
      synchronize: false,
    }),
    AuthModule,
    HealthModule,
    UsersModule,
    VendorsModule,
  ],
})
export class AppModule {}
