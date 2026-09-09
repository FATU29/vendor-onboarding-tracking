import { MigrationInterface, QueryRunner } from 'typeorm';

/** Moves configurable business thresholds out of source code and into PostgreSQL. */
export class AddAppSettings1725900000003 implements MigrationInterface {
  name = 'AddAppSettings1725900000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "app_settings" (
        "key" character varying(100) NOT NULL,
        "integerValue" integer NOT NULL,
        "description" character varying(255),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_app_settings" PRIMARY KEY ("key"),
        CONSTRAINT "CHK_app_settings_positive_integer" CHECK ("integerValue" > 0)
      )
    `);
    await queryRunner.query(`
      INSERT INTO "app_settings" ("key", "integerValue", "description")
      VALUES ('vendor_stuck_threshold_days', 7, 'Số ngày tối đa vendor được ở một trạng thái chưa hoàn tất trước khi bị đánh dấu là kẹt')
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "app_settings"');
  }
}
