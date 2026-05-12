import { MigrationInterface, QueryRunner } from "typeorm"

export class FixBusinessSubscriptionsIdDefault1778544000000 implements MigrationInterface {
  name = "FixBusinessSubscriptionsIdDefault1778544000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "business_subscriptions"
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "business_subscriptions"
      ALTER COLUMN "id" DROP DEFAULT;
    `)
  }
}
