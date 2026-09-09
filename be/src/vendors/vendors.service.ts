import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { isVendorStuck } from '../common/vendor-workflow';
import {
  APP_SETTING_REPOSITORY,
  AppSettingRepository,
  VENDOR_STUCK_THRESHOLD_DAYS_SETTING,
} from '../settings/app-setting.repository';
import { USER_REPOSITORY, UserRepository } from '../users/user.repository';
import { RedisLockService } from './redis-lock.service';
import { UpdateStuckThresholdDto } from './update-stuck-threshold.dto';
import { UpdateVendorStageDto } from './update-vendor-stage.dto';
import {
  VENDOR_REPOSITORY,
  VendorRecord,
  VendorRepository,
} from './vendor.repository';

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

const SEED_VENDORS = [
  { name: 'Company A', region: 'HCMC', stageId: 5, stageEnteredAt: daysAgo(30), notes: null },
  { name: 'Company B', region: 'Can Tho', stageId: 3, stageEnteredAt: daysAgo(10), notes: 'Waiting on business license re-upload' },
  { name: 'Company C', region: 'Hanoi', stageId: 2, stageEnteredAt: daysAgo(3), notes: null },
  { name: 'Company D', region: 'HCMC', stageId: 4, stageEnteredAt: daysAgo(1), notes: null },
  { name: 'Company E', region: 'Da Nang', stageId: 3, stageEnteredAt: daysAgo(8), notes: null },
  { name: 'Company F', region: 'HCMC', stageId: 1, stageEnteredAt: daysAgo(5), notes: null },
];

@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name);

  constructor(
    @Inject(VENDOR_REPOSITORY) private readonly repository: VendorRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(APP_SETTING_REPOSITORY) private readonly settings: AppSettingRepository,
    private readonly redisLock: RedisLockService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (await this.repository.countVendors()) return;

    const coordinators = await this.users.findAll();
    if (!coordinators.length) return;
    const count = await this.repository.seedVendors(
      SEED_VENDORS.map((vendor, index) => ({
        ...vendor,
        lastUpdatedById: coordinators[index % coordinators.length].id,
      })),
    );
    this.logger.log(`Seeded ${count} vendors.`);
  }

  findStages() {
    return this.repository.findStages();
  }

  async findAll() {
    const [vendors, stuckThresholdDays] = await Promise.all([
      this.repository.findAllWithDetails(),
      this.getStuckThresholdDays(),
    ]);
    return vendors.map((vendor) => this.toVendorResponse(vendor, stuckThresholdDays));
  }

  async findStuckThreshold() {
    return { thresholdDays: await this.getStuckThresholdDays() };
  }

  async updateStuckThreshold(dto: UpdateStuckThresholdDto) {
    const updated = await this.settings.updateInteger(
      VENDOR_STUCK_THRESHOLD_DAYS_SETTING,
      dto.thresholdDays,
    );
    if (!updated) {
      this.logger.error(`Missing setting: ${VENDOR_STUCK_THRESHOLD_DAYS_SETTING}`);
      throw new InternalServerErrorException('Vendor stuck threshold is not configured correctly.');
    }
    return { thresholdDays: dto.thresholdDays };
  }

  async findHistory(vendorId: string) {
    if (!(await this.repository.vendorExists(vendorId))) {
      throw new NotFoundException('Vendor was not found.');
    }
    const history = await this.repository.findHistoryWithDetails(vendorId);
    return history.map(({ previousStage, nextStage, changedBy, ...entry }) => ({
      ...entry,
      previousStage: previousStage?.name ?? null,
      nextStage: nextStage.name,
      changedByName: changedBy.name,
    }));
  }

  async updateStage(vendorId: string, dto: UpdateVendorStageDto, coordinatorId: string) {
    try {
      return await this.redisLock.withLock(`vendor:${vendorId}`, async () => {
        const result = await this.repository.updateStage({
          vendorId,
          stageId: dto.stageId,
          expectedVersion: dto.version,
          notes: dto.notes?.trim() || null,
          coordinatorId,
          changedAt: new Date(),
        });
        if (result.kind === 'coordinator-not-found') {
          throw new NotFoundException('Coordinator was not found. Please log in again.');
        }
        if (result.kind === 'stage-not-found') {
          throw new NotFoundException('Vendor stage was not found. Reload and try again.');
        }
        if (result.kind === 'vendor-not-found') {
          throw new NotFoundException('Vendor was not found.');
        }
        if (result.kind === 'version-conflict') {
          throw new ConflictException('This vendor changed since it was loaded. Reload to see the latest update.');
        }
        const stuckThresholdDays = await this.getStuckThresholdDays();
        return this.toVendorResponse(result.vendor, stuckThresholdDays);
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'VENDOR_LOCKED') {
        throw new ConflictException('Vendor is being updated by another coordinator. Reload and try again.');
      }
      throw error;
    }
  }

  private async getStuckThresholdDays(): Promise<number> {
    const thresholdDays = await this.settings.findInteger(VENDOR_STUCK_THRESHOLD_DAYS_SETTING);
    if (!Number.isInteger(thresholdDays) || thresholdDays === null || thresholdDays < 1) {
      this.logger.error(`Missing or invalid setting: ${VENDOR_STUCK_THRESHOLD_DAYS_SETTING}`);
      throw new InternalServerErrorException('Vendor stuck threshold is not configured correctly.');
    }
    return thresholdDays;
  }

  private toVendorResponse(vendor: VendorRecord, stuckThresholdDays: number) {
    const { stage, lastUpdatedBy, ...record } = vendor;
    const elapsedMilliseconds = Math.max(0, Date.now() - vendor.stageEnteredAt.getTime());
    const daysInStage = Math.floor(elapsedMilliseconds / (24 * 60 * 60 * 1000));
    const isStuck = !stage.isTerminal && isVendorStuck(vendor.stageEnteredAt, stuckThresholdDays);

    return {
      ...record,
      stage: stage.name,
      isTerminal: stage.isTerminal,
      lastUpdatedByName: lastUpdatedBy?.name ?? null,
      daysInStage,
      overdueDays: isStuck ? Math.max(1, daysInStage - stuckThresholdDays) : 0,
      isStuck,
    };
  }
}
