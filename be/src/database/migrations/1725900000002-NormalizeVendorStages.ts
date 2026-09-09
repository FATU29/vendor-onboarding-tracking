import { MigrationInterface, QueryRunner } from 'typeorm';

/** Replaces PostgreSQL stage enums with normalized numeric stage references. */
export class NormalizeVendorStages1725900000002 implements MigrationInterface {
  name = 'NormalizeVendorStages1725900000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "vendor_stages" (
        "id" smallint NOT NULL,
        "name" character varying NOT NULL,
        "sortOrder" smallint NOT NULL,
        "isTerminal" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_vendor_stages" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_vendor_stages_name" UNIQUE ("name"),
        CONSTRAINT "UQ_vendor_stages_sort_order" UNIQUE ("sortOrder")
      )
    `);
    await queryRunner.query(`
      INSERT INTO "vendor_stages" ("id", "name", "sortOrder", "isTerminal") VALUES
        (1, 'Contract Sent', 1, false),
        (2, 'Contract Signed', 2, false),
        (3, 'KYC Docs Received', 3, false),
        (4, 'KYC Verified', 4, false),
        (5, 'Active', 5, true)
    `);

    await queryRunner.query('ALTER TABLE "vendors" ADD COLUMN "stageId" smallint');
    await queryRunner.query('ALTER TABLE "vendor_histories" ADD COLUMN "previousStageId" smallint');
    await queryRunner.query('ALTER TABLE "vendor_histories" ADD COLUMN "nextStageId" smallint');
    await queryRunner.query(`UPDATE "vendors" SET "stageId" = CASE "stage"::text
      WHEN 'Contract Sent' THEN 1 WHEN 'Contract Signed' THEN 2
      WHEN 'KYC Docs Received' THEN 3 WHEN 'KYC Verified' THEN 4 WHEN 'Active' THEN 5 END`);
    await queryRunner.query(`UPDATE "vendor_histories" SET "previousStageId" = CASE "previousStage"::text
      WHEN 'Contract Sent' THEN 1 WHEN 'Contract Signed' THEN 2
      WHEN 'KYC Docs Received' THEN 3 WHEN 'KYC Verified' THEN 4 WHEN 'Active' THEN 5 END`);
    await queryRunner.query(`UPDATE "vendor_histories" SET "nextStageId" = CASE "nextStage"::text
      WHEN 'Contract Sent' THEN 1 WHEN 'Contract Signed' THEN 2
      WHEN 'KYC Docs Received' THEN 3 WHEN 'KYC Verified' THEN 4 WHEN 'Active' THEN 5 END`);
    await queryRunner.query('ALTER TABLE "vendors" ALTER COLUMN "stageId" SET NOT NULL');
    await queryRunner.query('ALTER TABLE "vendor_histories" ALTER COLUMN "nextStageId" SET NOT NULL');
    await queryRunner.query('ALTER TABLE "vendors" ADD CONSTRAINT "FK_vendors_stage" FOREIGN KEY ("stageId") REFERENCES "vendor_stages"("id") ON DELETE RESTRICT');
    await queryRunner.query('ALTER TABLE "vendor_histories" ADD CONSTRAINT "FK_vendor_histories_previous_stage" FOREIGN KEY ("previousStageId") REFERENCES "vendor_stages"("id") ON DELETE RESTRICT');
    await queryRunner.query('ALTER TABLE "vendor_histories" ADD CONSTRAINT "FK_vendor_histories_next_stage" FOREIGN KEY ("nextStageId") REFERENCES "vendor_stages"("id") ON DELETE RESTRICT');
    await queryRunner.query('ALTER TABLE "vendors" DROP COLUMN "stage"');
    await queryRunner.query('ALTER TABLE "vendor_histories" DROP COLUMN "previousStage"');
    await queryRunner.query('ALTER TABLE "vendor_histories" DROP COLUMN "nextStage"');
    await queryRunner.query('DROP TYPE "vendors_stage_enum"');
    await queryRunner.query('DROP TYPE "vendor_histories_previousstage_enum"');
    await queryRunner.query('DROP TYPE "vendor_histories_nextstage_enum"');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "vendors_stage_enum" AS ENUM ('Contract Sent', 'Contract Signed', 'KYC Docs Received', 'KYC Verified', 'Active')`);
    await queryRunner.query(`CREATE TYPE "vendor_histories_previousstage_enum" AS ENUM ('Contract Sent', 'Contract Signed', 'KYC Docs Received', 'KYC Verified', 'Active')`);
    await queryRunner.query(`CREATE TYPE "vendor_histories_nextstage_enum" AS ENUM ('Contract Sent', 'Contract Signed', 'KYC Docs Received', 'KYC Verified', 'Active')`);
    await queryRunner.query('ALTER TABLE "vendors" ADD COLUMN "stage" "vendors_stage_enum"');
    await queryRunner.query('ALTER TABLE "vendor_histories" ADD COLUMN "previousStage" "vendor_histories_previousstage_enum"');
    await queryRunner.query('ALTER TABLE "vendor_histories" ADD COLUMN "nextStage" "vendor_histories_nextstage_enum"');
    await queryRunner.query(`UPDATE "vendors" AS vendor SET "stage" = stage."name"::"vendors_stage_enum" FROM "vendor_stages" AS stage WHERE vendor."stageId" = stage."id"`);
    await queryRunner.query(`UPDATE "vendor_histories" AS history SET "previousStage" = stage."name"::"vendor_histories_previousstage_enum" FROM "vendor_stages" AS stage WHERE history."previousStageId" = stage."id"`);
    await queryRunner.query(`UPDATE "vendor_histories" AS history SET "nextStage" = stage."name"::"vendor_histories_nextstage_enum" FROM "vendor_stages" AS stage WHERE history."nextStageId" = stage."id"`);
    await queryRunner.query('ALTER TABLE "vendors" ALTER COLUMN "stage" SET NOT NULL');
    await queryRunner.query('ALTER TABLE "vendor_histories" ALTER COLUMN "nextStage" SET NOT NULL');
    await queryRunner.query('ALTER TABLE "vendor_histories" DROP CONSTRAINT "FK_vendor_histories_next_stage"');
    await queryRunner.query('ALTER TABLE "vendor_histories" DROP CONSTRAINT "FK_vendor_histories_previous_stage"');
    await queryRunner.query('ALTER TABLE "vendors" DROP CONSTRAINT "FK_vendors_stage"');
    await queryRunner.query('ALTER TABLE "vendor_histories" DROP COLUMN "nextStageId"');
    await queryRunner.query('ALTER TABLE "vendor_histories" DROP COLUMN "previousStageId"');
    await queryRunner.query('ALTER TABLE "vendors" DROP COLUMN "stageId"');
    await queryRunner.query('DROP TABLE "vendor_stages"');
  }
}
