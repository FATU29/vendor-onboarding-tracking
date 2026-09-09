import { DataSource } from 'typeorm';
import { AppSetting } from '../settings/app-setting.entity';
import { User } from '../users/user.entity';
import { VendorHistory } from '../vendors/vendor-history.entity';
import { VendorStageEntity } from '../vendors/vendor-stage.entity';
import { Vendor } from '../vendors/vendor.entity';
import {
  AddAppSettings1725900000003,
  InitialVendorTracker1725900000000,
  NormalizeAuditActors1725900000001,
  NormalizeVendorStages1725900000002,
} from './migrations';

/**
 * Shared TypeORM configuration for migration CLI commands and production startup.
 * Schema changes must be represented by migrations; synchronize stays disabled.
 */
const appDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'vendor_tracker',
  entities: [AppSetting, User, Vendor, VendorHistory, VendorStageEntity],
  migrations: [
    InitialVendorTracker1725900000000,
    NormalizeAuditActors1725900000001,
    NormalizeVendorStages1725900000002,
    AddAppSettings1725900000003,
  ],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
});

export default appDataSource;
