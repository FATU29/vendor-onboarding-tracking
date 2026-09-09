import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppSetting } from './app-setting.entity';
import { APP_SETTING_REPOSITORY } from './app-setting.repository';
import { TypeOrmAppSettingRepository } from './typeorm-app-setting.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AppSetting])],
  providers: [
    TypeOrmAppSettingRepository,
    { provide: APP_SETTING_REPOSITORY, useExisting: TypeOrmAppSettingRepository },
  ],
  exports: [APP_SETTING_REPOSITORY],
})
export class SettingsModule {}
