import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { VendorHistory } from './vendor-history.entity';
import { Vendor } from './vendor.entity';

/** A configurable stage in the vendor onboarding workflow. */
@Entity('vendor_stages')
export class VendorStageEntity {
  @PrimaryColumn({ type: 'smallint' })
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'smallint', unique: true })
  sortOrder!: number;

  /** True once a vendor has completed onboarding. */
  @Column({ default: false })
  isTerminal!: boolean;

  @OneToMany(() => Vendor, (vendor) => vendor.stage)
  vendors?: Vendor[];

  @OneToMany(() => VendorHistory, (history) => history.previousStage)
  previousHistory?: VendorHistory[];

  @OneToMany(() => VendorHistory, (history) => history.nextStage)
  nextHistory?: VendorHistory[];
}
