import { Check, Column, Entity, PrimaryColumn } from 'typeorm';

/** Numeric business settings that can be changed without rebuilding the application. */
@Entity('app_settings')
@Check('CHK_app_settings_positive_integer', '"integerValue" > 0')
export class AppSetting {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  key!: string;

  @Column({ type: 'integer' })
  integerValue!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
