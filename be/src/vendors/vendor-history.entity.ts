import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Vendor } from './vendor.entity';
import { VendorStageEntity } from './vendor-stage.entity';

@Entity('vendor_histories')
export class VendorHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  /** Null only for the history row created while a vendor is first seeded. */
  @Column({ type: 'smallint', nullable: true })
  previousStageId: number | null;

  @ManyToOne(() => VendorStageEntity, (stage) => stage.previousHistory, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'previousStageId' })
  previousStage: VendorStageEntity | null;

  @Column({ type: 'smallint' })
  nextStageId: number;

  @ManyToOne(() => VendorStageEntity, (stage) => stage.nextHistory, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'nextStageId' })
  nextStage: VendorStageEntity;

  /** Foreign key to the coordinator who created this immutable audit record. */
  @Column({ type: 'uuid' })
  changedById: string;

  @ManyToOne(() => User, (user) => user.stageChanges, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'changedById' })
  changedBy: User;

  @CreateDateColumn({ type: 'timestamptz' })
  changedAt: Date;
}
