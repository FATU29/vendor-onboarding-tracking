import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSetting } from './app-setting.entity';
import { AppSettingRepository } from './app-setting.repository';

/** TypeORM adapter for application settings. */
@Injectable()
export class TypeOrmAppSettingRepository implements AppSettingRepository {
  constructor(
    @InjectRepository(AppSetting)
    private readonly repository: Repository<AppSetting>,
  ) {}

  async findInteger(key: string): Promise<number | null> {
    const setting = await this.repository.findOne({
      select: { integerValue: true },
      where: { key },
    });
    return setting?.integerValue ?? null;
  }

  async updateInteger(key: string, value: number): Promise<boolean> {
    const result = await this.repository.update(
      { key },
      { integerValue: value, updatedAt: new Date() },
    );
    return result.affected === 1;
  }
}
