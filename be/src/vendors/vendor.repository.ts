import { UserRecord } from '../users/user.repository';

/** Injection token for the vendor persistence port. */
export const VENDOR_REPOSITORY = Symbol('VENDOR_REPOSITORY');

export interface VendorStageRecord {
  id: number;
  name: string;
  sortOrder: number;
  isTerminal: boolean;
}

export interface VendorRecord {
  id: string;
  name: string;
  region: string;
  stageId: number;
  stage: VendorStageRecord;
  stageEnteredAt: Date;
  notes: string | null;
  lastUpdatedById: string | null;
  lastUpdatedBy: UserRecord | null;
  version: number;
}

export interface VendorHistoryRecord {
  id: string;
  vendorId: string;
  previousStageId: number | null;
  previousStage: VendorStageRecord | null;
  nextStageId: number;
  nextStage: VendorStageRecord;
  changedById: string;
  changedBy: UserRecord;
  changedAt: Date;
}

export interface SeedVendorRecord {
  name: string;
  region: string;
  stageId: number;
  stageEnteredAt: Date;
  notes: string | null;
  lastUpdatedById: string;
}

export interface UpdateVendorStageCommand {
  vendorId: string;
  stageId: number;
  expectedVersion: number;
  notes: string | null;
  coordinatorId: string;
  changedAt: Date;
}

export type UpdateVendorStageResult =
  | { kind: 'updated'; vendor: VendorRecord }
  | { kind: 'coordinator-not-found' }
  | { kind: 'stage-not-found' }
  | { kind: 'vendor-not-found' }
  | { kind: 'version-conflict' };

/** Persistence operations needed by vendor application logic. */
export interface VendorRepository {
  countVendors(): Promise<number>;
  seedVendors(records: SeedVendorRecord[]): Promise<number>;
  findStages(): Promise<VendorStageRecord[]>;
  findAllWithDetails(): Promise<VendorRecord[]>;
  vendorExists(id: string): Promise<boolean>;
  findHistoryWithDetails(vendorId: string): Promise<VendorHistoryRecord[]>;
  updateStage(command: UpdateVendorStageCommand): Promise<UpdateVendorStageResult>;
}
