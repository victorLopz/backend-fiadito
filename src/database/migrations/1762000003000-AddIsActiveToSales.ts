import { MigrationInterface, QueryRunner } from "typeorm"

export class AddIsActiveToSales1762000003000 implements MigrationInterface {
  name = "AddIsActiveToSales1762000003000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true`
    )

    await queryRunner.query(`UPDATE "sales" SET "is_active" = true WHERE "is_active" IS NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN IF EXISTS "is_active"`)
  }
}
