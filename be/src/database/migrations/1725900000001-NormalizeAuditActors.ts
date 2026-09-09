import { MigrationInterface, QueryRunner } from 'typeorm';

/** Removes duplicated coordinator names and enforces user references for audit data. */
export class NormalizeAuditActors1725900000001 implements MigrationInterface {
  name = 'NormalizeAuditActors1725900000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "vendors" DROP COLUMN IF EXISTS "lastUpdatedByName"');
    await queryRunner.query('ALTER TABLE "vendor_histories" DROP COLUMN IF EXISTS "changedByName"');
    await queryRunner.query(`
      ALTER TABLE "vendors"
      ADD CONSTRAINT "FK_vendors_last_updated_by_user"
      FOREIGN KEY ("lastUpdatedById") REFERENCES "users"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "vendor_histories"
      ADD CONSTRAINT "FK_vendor_histories_changed_by_user"
      FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE RESTRICT
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "vendors" ADD COLUMN "lastUpdatedByName" character varying');
    await queryRunner.query('ALTER TABLE "vendor_histories" ADD COLUMN "changedByName" character varying');
    await queryRunner.query(`
      UPDATE "vendors" AS vendor
      SET "lastUpdatedByName" = user_record."name"
      FROM "users" AS user_record
      WHERE vendor."lastUpdatedById" = user_record."id"
    `);
    await queryRunner.query(`
      UPDATE "vendor_histories" AS history
      SET "changedByName" = user_record."name"
      FROM "users" AS user_record
      WHERE history."changedById" = user_record."id"
    `);
    await queryRunner.query('ALTER TABLE "vendor_histories" DROP CONSTRAINT "FK_vendor_histories_changed_by_user"');
    await queryRunner.query('ALTER TABLE "vendors" DROP CONSTRAINT "FK_vendors_last_updated_by_user"');
  }
}
