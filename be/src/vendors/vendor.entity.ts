import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { VendorHistory } from './vendor-history.entity';
import { VendorStageEntity } from './vendor-stage.entity';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name: string;

  @Column()
  region: string;

  /** Numeric foreign key to the configurable vendor_stages lookup table. */
  @Column({ type: 'smallint' })
  stageId: number;

  @ManyToOne(() => VendorStageEntity, (stage) => stage.vendors, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'stageId' })
  stage: VendorStageEntity;

  @Column({ type: 'timestamptz' })
  stageEnteredAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  /** Foreign key to the coordinator who most recently updated this vendor. */
  @Column({ type: 'uuid', nullable: true })
  lastUpdatedById: string | null;

  @ManyToOne(() => User, (user) => user.lastUpdatedVendors, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lastUpdatedById' })
  lastUpdatedBy: User | null;

  @Column({ default: 1 })
  version: number;

  @OneToMany(() => VendorHistory, (history) => history.vendor)
  history: VendorHistory[];
}
