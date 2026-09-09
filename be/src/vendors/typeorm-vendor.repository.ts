import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { VendorHistory } from './vendor-history.entity';
import {
  SeedVendorRecord,
  UpdateVendorStageCommand,
  UpdateVendorStageResult,
  VendorRepository,
} from './vendor.repository';
import { VendorStageEntity } from './vendor-stage.entity';
import { Vendor } from './vendor.entity';

/** TypeORM adapter for all vendor persistence and transaction concerns. */
@Injectable()
export class TypeOrmVendorRepository implements VendorRepository {
  constructor(
    @InjectRepository(Vendor) private readonly vendors: Repository<Vendor>,
    @InjectRepository(VendorHistory) private readonly histories: Repository<VendorHistory>,
    @InjectRepository(VendorStageEntity) private readonly stages: Repository<VendorStageEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  countVendors(): Promise<number> {
    return this.vendors.count();
  }

  async seedVendors(records: SeedVendorRecord[]): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const saved = await manager.save(Vendor, records);
      await manager.save(
        VendorHistory,
        saved.map((vendor) => ({
          vendorId: vendor.id,
          previousStageId: null,
          nextStageId: vendor.stageId,
          changedById: vendor.lastUpdatedById!,
          changedAt: vendor.stageEnteredAt,
        })),
      );
      return saved.length;
    });
  }

  findStages(): Promise<VendorStageEntity[]> {
    return this.stages.find({ order: { sortOrder: 'ASC' } });
  }

  findAllWithDetails(): Promise<Vendor[]> {
    return this.vendors.find({
      relations: { stage: true, lastUpdatedBy: true },
      order: { name: 'ASC' },
    });
  }

  vendorExists(id: string): Promise<boolean> {
    return this.vendors.existsBy({ id });
  }

  findHistoryWithDetails(vendorId: string): Promise<VendorHistory[]> {
    return this.histories.find({
      where: { vendorId },
      relations: { previousStage: true, nextStage: true, changedBy: true },
      order: { changedAt: 'DESC' },
    });
  }

  updateStage(command: UpdateVendorStageCommand): Promise<UpdateVendorStageResult> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOneBy(User, { id: command.coordinatorId });
      if (!user) return { kind: 'coordinator-not-found' };

      const requestedStage = await manager.findOneBy(VendorStageEntity, { id: command.stageId });
      if (!requestedStage) return { kind: 'stage-not-found' };

      const vendor = await manager.findOneBy(Vendor, { id: command.vendorId });
      if (!vendor) return { kind: 'vendor-not-found' };
      if (vendor.version !== command.expectedVersion) return { kind: 'version-conflict' };

      const stageChanged = vendor.stageId !== requestedStage.id;
      const update = await manager
        .createQueryBuilder()
        .update(Vendor)
        .set({
          stageId: requestedStage.id,
          stageEnteredAt: stageChanged ? command.changedAt : vendor.stageEnteredAt,
          notes: command.notes,
          lastUpdatedById: user.id,
          version: () => 'version + 1',
        })
        .where('id = :id AND version = :version', {
          id: command.vendorId,
          version: command.expectedVersion,
        })
        .execute();

      if (update.affected !== 1) return { kind: 'version-conflict' };

      if (stageChanged) {
        await manager.save(VendorHistory, {
          vendorId: command.vendorId,
          previousStageId: vendor.stageId,
          nextStageId: requestedStage.id,
          changedById: user.id,
          changedAt: command.changedAt,
        });
      }

      const updatedVendor = await manager.findOneOrFail(Vendor, {
        where: { id: command.vendorId },
        relations: { stage: true, lastUpdatedBy: true },
      });
      return { kind: 'updated', vendor: updatedVendor };
    });
  }
}
