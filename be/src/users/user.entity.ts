import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VendorHistory } from '../vendors/vendor-history.entity';
import { Vendor } from '../vendors/vendor.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  /** Vendors whose most recent update was made by this coordinator. */
  @OneToMany(() => Vendor, (vendor) => vendor.lastUpdatedBy)
  lastUpdatedVendors?: Vendor[];

  /** Immutable stage-history records created by this coordinator. */
  @OneToMany(() => VendorHistory, (history) => history.changedBy)
  stageChanges?: VendorHistory[];
}
