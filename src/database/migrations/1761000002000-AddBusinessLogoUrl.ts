import { MigrationInterface, QueryRunner } from "typeorm"

export class AddBusinessLogoUrl1761000002000 implements MigrationInterface {
  name = "AddBusinessLogoUrl1761000002000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "logo_url" varchar`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "businesses" DROP COLUMN IF EXISTS "logo_url"`)
  }
}
