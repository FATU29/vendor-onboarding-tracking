import { ConflictException } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';
import { AppSettingRepository } from '../src/settings/app-setting.repository';
import { RedisLockService } from '../src/vendors/redis-lock.service';
import { VendorRecord, VendorRepository } from '../src/vendors/vendor.repository';
import { VendorsService } from '../src/vendors/vendors.service';
import { UserRepository } from '../src/users/user.repository';

const stage = { id: 3, name: 'KYC Docs Received', sortOrder: 3, isTerminal: false };
const coordinator = { id: 'user-1', name: 'Linh' };
const vendor: VendorRecord = {
  id: 'vendor-1',
  name: 'Company A',
  region: 'HCMC',
  stageId: stage.id,
  stage,
  stageEnteredAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  notes: null,
  lastUpdatedById: coordinator.id,
  lastUpdatedBy: coordinator,
  version: 2,
};

function createRepository(overrides: Partial<VendorRepository> = {}): VendorRepository {
  return {
    countVendors: async () => 1,
    seedVendors: async () => 0,
    findStages: async () => [stage],
    findAllWithDetails: async () => [vendor],
    vendorExists: async () => true,
    findHistoryWithDetails: async () => [],
    updateStage: async () => ({ kind: 'updated', vendor }),
    ...overrides,
  };
}

const users: UserRepository = {
  upsertByName: async () => undefined,
  findAll: async () => [coordinator],
  findById: async () => coordinator,
};

const settings: AppSettingRepository = {
  findInteger: async () => 7,
  updateInteger: async () => true,
};

const lock = {
  withLock: <T>(_key: string, work: () => Promise<T>) => work(),
} as RedisLockService;

describe('VendorsService repository port', () => {
  it('maps persistence records without depending on TypeORM entities', async () => {
    const service = new VendorsService(createRepository(), users, settings, lock);

    await expect(service.findAll()).resolves.toEqual([
      expect.objectContaining({
        id: vendor.id,
        stageId: stage.id,
        stage: stage.name,
        lastUpdatedByName: coordinator.name,
        isStuck: true,
      }),
    ]);
  });

  it('uses the stuck threshold supplied by the settings repository', async () => {
    const customSettings: AppSettingRepository = {
      findInteger: async () => 10,
      updateInteger: async () => true,
    };
    const service = new VendorsService(createRepository(), users, customSettings, lock);

    await expect(service.findAll()).resolves.toEqual([
      expect.objectContaining({ isStuck: false, overdueDays: 0 }),
    ]);
  });

  it('reads and updates the stuck threshold through the settings repository', async () => {
    const updateInteger = jest.fn<AppSettingRepository['updateInteger']>().mockResolvedValue(true);
    const customSettings: AppSettingRepository = {
      findInteger: async () => 7,
      updateInteger,
    };
    const service = new VendorsService(createRepository(), users, customSettings, lock);

    await expect(service.findStuckThreshold()).resolves.toEqual({ thresholdDays: 7 });
    await expect(service.updateStuckThreshold({ thresholdDays: 14 })).resolves.toEqual({ thresholdDays: 14 });
    expect(updateInteger).toHaveBeenCalledWith('vendor_stuck_threshold_days', 14);
  });

  it('delegates an atomic update command and maps version conflicts', async () => {
    const updateStage = jest.fn<VendorRepository['updateStage']>()
      .mockResolvedValue({ kind: 'version-conflict' });
    const service = new VendorsService(createRepository({ updateStage }), users, settings, lock);

    await expect(
      service.updateStage(vendor.id, { stageId: 4, version: 2, notes: '  ready  ' }, coordinator.id),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(updateStage).toHaveBeenCalledWith(expect.objectContaining({
      vendorId: vendor.id,
      stageId: 4,
      expectedVersion: 2,
      notes: 'ready',
      coordinatorId: coordinator.id,
    }));
  });
});
