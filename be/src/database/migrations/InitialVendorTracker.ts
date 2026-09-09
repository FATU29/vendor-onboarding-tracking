import { MigrationInterface, QueryRunner } from 'typeorm';

/** Creates the initial schema for the vendor onboarding tracker. */
export class InitialVendorTracker1725900000000 implements MigrationInterface {
  name = 'InitialVendorTracker1725900000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "vendors_stage_enum" AS ENUM ('Contract Sent', 'Contract Signed', 'KYC Docs Received', 'KYC Verified', 'Active');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
      DO $$ BEGIN
        CREATE TYPE "vendor_histories_previousstage_enum" AS ENUM ('Contract Sent', 'Contract Signed', 'KYC Docs Received', 'KYC Verified', 'Active');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
      DO $$ BEGIN
        CREATE TYPE "vendor_histories_nextstage_enum" AS ENUM ('Contract Sent', 'Contract Signed', 'KYC Docs Received', 'KYC Verified', 'Active');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        CONSTRAINT "PK_7a5f0f1b6b9275b0dfb5cd31e1a" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_51a5f36f3ecf3a9a94077e5b0bb" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendors" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "region" character varying NOT NULL,
        "stage" "vendors_stage_enum" NOT NULL,
        "stageEnteredAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "notes" text,
        "lastUpdatedById" uuid,
        "lastUpdatedByName" character varying,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_9c956c9797edfae5c6ddacc4e6e" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_83065ec2a2c5052786c122e95ba" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendor_histories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "vendorId" uuid NOT NULL,
        "previousStage" "vendor_histories_previousstage_enum",
        "nextStage" "vendor_histories_nextstage_enum" NOT NULL,
        "changedById" uuid NOT NULL,
        "changedByName" character varying NOT NULL,
        "changedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_146478874cb57e85579b131efb1" PRIMARY KEY ("id"),
        CONSTRAINT "FK_43df26dab3e558095ae9cd44343" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_vendor_histories_vendor_changed_at" ON "vendor_histories" ("vendorId", "changedAt" DESC)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_vendor_histories_vendor_changed_at"');
    await queryRunner.query('DROP TABLE IF EXISTS "vendor_histories"');
    await queryRunner.query('DROP TABLE IF EXISTS "vendors"');
    await queryRunner.query('DROP TABLE IF EXISTS "users"');
    await queryRunner.query('DROP TYPE IF EXISTS "vendor_histories_nextstage_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "vendor_histories_previousstage_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "vendors_stage_enum"');
  }
}
