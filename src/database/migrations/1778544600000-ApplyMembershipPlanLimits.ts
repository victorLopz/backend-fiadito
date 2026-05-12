import { MigrationInterface, QueryRunner } from "typeorm"

export class ApplyMembershipPlanLimits1778544600000 implements MigrationInterface {
  name = "ApplyMembershipPlanLimits1778544600000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "plans"
      ADD COLUMN IF NOT EXISTS "customer_limit" int NULL,
      ADD COLUMN IF NOT EXISTS "allow_product_images" boolean NOT NULL DEFAULT false;
    `)

    await queryRunner.query(`
      ALTER TABLE "plans"
      ALTER COLUMN "product_limit" DROP NOT NULL,
      ALTER COLUMN "sales_history_days_limit" DROP NOT NULL;
    `)

    await queryRunner.query(`
      UPDATE "plans"
      SET
        "product_limit" = 10,
        "customer_limit" = 5,
        "sales_history_days_limit" = 7,
        "allow_product_images" = false
      WHERE "code" = 'FREE';
    `)

    await queryRunner.query(`
      UPDATE "plans"
      SET
        "product_limit" = 50,
        "customer_limit" = 25,
        "sales_history_days_limit" = 90,
        "allow_product_images" = true
      WHERE "code" = 'LITE';
    `)

    await queryRunner.query(`
      UPDATE "plans"
      SET
        "product_limit" = NULL,
        "customer_limit" = NULL,
        "sales_history_days_limit" = NULL,
        "allow_product_images" = true
      WHERE "code" = 'PRO';
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "plans"
      SET
        "product_limit" = COALESCE("product_limit", 10000),
        "sales_history_days_limit" = COALESCE("sales_history_days_limit", 1825);
    `)

    await queryRunner.query(`
      ALTER TABLE "plans"
      ALTER COLUMN "product_limit" SET NOT NULL,
      ALTER COLUMN "sales_history_days_limit" SET NOT NULL;
    `)

    await queryRunner.query(`
      ALTER TABLE "plans"
      DROP COLUMN IF EXISTS "allow_product_images",
      DROP COLUMN IF EXISTS "customer_limit";
    `)
  }
}
