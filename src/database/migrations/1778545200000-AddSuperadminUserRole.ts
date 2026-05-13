import { MigrationInterface, QueryRunner } from "typeorm"

export class AddSuperadminUserRole1778545200000 implements MigrationInterface {
  name = "AddSuperadminUserRole1778545200000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."users_role_enum"
      ADD VALUE IF NOT EXISTS 'SUPERADMIN';
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "users"
      SET "role" = 'OWNER'
      WHERE "role" = 'SUPERADMIN';
    `)

    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum_old" AS ENUM('OWNER', 'ADMIN', 'CASHIER');
    `)

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role" DROP DEFAULT,
      ALTER COLUMN "role" TYPE "public"."users_role_enum_old"
      USING "role"::text::"public"."users_role_enum_old",
      ALTER COLUMN "role" SET DEFAULT 'CASHIER';
    `)

    await queryRunner.query(`
      DROP TYPE "public"."users_role_enum";
    `)

    await queryRunner.query(`
      ALTER TYPE "public"."users_role_enum_old"
      RENAME TO "users_role_enum";
    `)
  }
}
