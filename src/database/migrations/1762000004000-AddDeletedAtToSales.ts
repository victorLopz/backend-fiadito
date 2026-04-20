import { MigrationInterface, QueryRunner } from "typeorm"

export class AddDeletedAtToSales1762000004000 implements MigrationInterface {
  name = "AddDeletedAtToSales1762000004000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN IF EXISTS "deleted_at"`)
  }
}
