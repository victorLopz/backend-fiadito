import { MigrationInterface, QueryRunner } from "typeorm"

export class AddMembershipSaasModel1763000000000 implements MigrationInterface {
  name = "AddMembershipSaasModel1763000000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
          CREATE TYPE "public"."users_role_enum" AS ENUM('OWNER', 'ADMIN', 'CASHIER');
        END IF;
      END
      $$;
    `)

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "role" "public"."users_role_enum" NOT NULL DEFAULT 'OWNER';
    `)

    await queryRunner.query(`
      ALTER TABLE "plans"
      ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
    `)

    await queryRunner.query(`
      ALTER TABLE "plans"
      ADD COLUMN IF NOT EXISTS "name" varchar(80) NOT NULL DEFAULT 'Free',
      ADD COLUMN IF NOT EXISTS "description" text NULL,
      ADD COLUMN IF NOT EXISTS "price_monthly" numeric(12, 2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "currency_code" varchar(3) NOT NULL DEFAULT 'USD',
      ADD COLUMN IF NOT EXISTS "product_limit" int NOT NULL DEFAULT 100,
      ADD COLUMN IF NOT EXISTS "sales_history_days_limit" int NOT NULL DEFAULT 30,
      ADD COLUMN IF NOT EXISTS "billing_period_days" int NOT NULL DEFAULT 30,
      ADD COLUMN IF NOT EXISTS "grace_period_days" int NOT NULL DEFAULT 3,
      ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "sort_order" int NOT NULL DEFAULT 0;
    `)

    await queryRunner.query(`
      INSERT INTO "plans" (
        "code",
        "name",
        "description",
        "price_monthly",
        "currency_code",
        "product_limit",
        "sales_history_days_limit",
        "billing_period_days",
        "grace_period_days",
        "is_active",
        "sort_order"
      )
      VALUES
        ('FREE', 'Free', 'Plan inicial para negocios pequeños.', 0, 'USD', 100, 30, 30, 3, true, 1),
        ('LITE', 'Lite', 'Plan para negocios en crecimiento.', 0, 'USD', 1000, 365, 30, 5, true, 2),
        ('PRO', 'Pro', 'Plan avanzado para operación con más historial y catálogo.', 0, 'USD', 10000, 1825, 30, 7, true, 3)
      ON CONFLICT ("code") DO UPDATE SET
        "name" = EXCLUDED."name",
        "description" = EXCLUDED."description",
        "price_monthly" = EXCLUDED."price_monthly",
        "currency_code" = EXCLUDED."currency_code",
        "product_limit" = EXCLUDED."product_limit",
        "sales_history_days_limit" = EXCLUDED."sales_history_days_limit",
        "billing_period_days" = EXCLUDED."billing_period_days",
        "grace_period_days" = EXCLUDED."grace_period_days",
        "is_active" = EXCLUDED."is_active",
        "sort_order" = EXCLUDED."sort_order";
    `)

    await queryRunner.query(`
      ALTER TABLE "business_subscriptions"
      ADD COLUMN IF NOT EXISTS "current_period_start" timestamptz NULL,
      ADD COLUMN IF NOT EXISTS "current_period_end" timestamptz NULL,
      ADD COLUMN IF NOT EXISTS "grace_period_ends_at" timestamptz NULL,
      ADD COLUMN IF NOT EXISTS "cancelled_at" timestamptz NULL,
      ADD COLUMN IF NOT EXISTS "last_payment_at" timestamptz NULL,
      ADD COLUMN IF NOT EXISTS "metadata" jsonb NULL;
    `)

    await queryRunner.query(`
      UPDATE "business_subscriptions"
      SET
        "current_period_start" = COALESCE("current_period_start", "started_at", now()),
        "current_period_end" = COALESCE("current_period_end", now() + interval '30 days'),
        "grace_period_ends_at" = COALESCE(
          "grace_period_ends_at",
          COALESCE("current_period_end", now() + interval '30 days') + interval '3 days'
        ),
        "last_payment_at" = COALESCE("last_payment_at", "updated_at")
      WHERE "current_period_start" IS NULL
         OR "current_period_end" IS NULL
         OR "grace_period_ends_at" IS NULL;
    `)

    await queryRunner.query(`
      UPDATE "business_subscriptions"
      SET "status" = 'ACTIVE'
      WHERE "status" IS NULL;
    `)

    await queryRunner.query(`
      WITH ranked AS (
        SELECT
          "id",
          row_number() OVER (
            PARTITION BY "business_id"
            ORDER BY "created_at" DESC, "id" DESC
          ) AS rn
        FROM "business_subscriptions"
        WHERE "status" IN ('ACTIVE', 'PAST_DUE')
      )
      UPDATE "business_subscriptions" bs
      SET "status" = 'EXPIRED'
      FROM ranked
      WHERE bs."id" = ranked."id" AND ranked.rn > 1;
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "membership_payments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "business_id" uuid NOT NULL,
        "subscription_id" uuid NOT NULL,
        "plan_id" uuid NOT NULL,
        "amount" numeric(12, 2) NOT NULL,
        "currency" varchar(3) NOT NULL DEFAULT 'NIO',
        "status" varchar NOT NULL DEFAULT 'PAID',
        "method" varchar NOT NULL DEFAULT 'MANUAL',
        "external_reference" varchar NULL,
        "paid_at" timestamptz NULL,
        "period_start" timestamptz NOT NULL,
        "period_end" timestamptz NOT NULL,
        "created_by" uuid NULL,
        "metadata" jsonb NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
    `)

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'business_subscriptions_business_fkey'
        ) THEN
          ALTER TABLE "business_subscriptions"
          ADD CONSTRAINT "business_subscriptions_business_fkey"
          FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'business_subscriptions_plan_fkey'
        ) THEN
          ALTER TABLE "business_subscriptions"
          ADD CONSTRAINT "business_subscriptions_plan_fkey"
          FOREIGN KEY ("plan_id") REFERENCES "plans" ("id");
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'membership_payments_business_fkey'
        ) THEN
          ALTER TABLE "membership_payments"
          ADD CONSTRAINT "membership_payments_business_fkey"
          FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'membership_payments_subscription_fkey'
        ) THEN
          ALTER TABLE "membership_payments"
          ADD CONSTRAINT "membership_payments_subscription_fkey"
          FOREIGN KEY ("subscription_id") REFERENCES "business_subscriptions" ("id") ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'membership_payments_plan_fkey'
        ) THEN
          ALTER TABLE "membership_payments"
          ADD CONSTRAINT "membership_payments_plan_fkey"
          FOREIGN KEY ("plan_id") REFERENCES "plans" ("id");
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'membership_payments_created_by_fkey'
        ) THEN
          ALTER TABLE "membership_payments"
          ADD CONSTRAINT "membership_payments_created_by_fkey"
          FOREIGN KEY ("created_by") REFERENCES "users" ("id");
        END IF;
      END
      $$;
    `)

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_business_subscriptions_one_open"
      ON "business_subscriptions" ("business_id")
      WHERE "status" IN ('ACTIVE', 'PAST_DUE');
    `)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_business_subscriptions_business_status"
      ON "business_subscriptions" ("business_id", "status");
    `)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_membership_payments_business_paid_at"
      ON "membership_payments" ("business_id", "paid_at");
    `)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_membership_payments_subscription_paid_at"
      ON "membership_payments" ("subscription_id", "paid_at");
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_membership_payments_subscription_paid_at"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_membership_payments_business_paid_at"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_business_subscriptions_business_status"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_business_subscriptions_one_open"`)

    await queryRunner.query(`
      ALTER TABLE "membership_payments"
      DROP CONSTRAINT IF EXISTS "membership_payments_created_by_fkey",
      DROP CONSTRAINT IF EXISTS "membership_payments_plan_fkey",
      DROP CONSTRAINT IF EXISTS "membership_payments_subscription_fkey",
      DROP CONSTRAINT IF EXISTS "membership_payments_business_fkey";
    `)
    await queryRunner.query(`DROP TABLE IF EXISTS "membership_payments"`)

    await queryRunner.query(`
      ALTER TABLE "business_subscriptions"
      DROP CONSTRAINT IF EXISTS "business_subscriptions_plan_fkey",
      DROP CONSTRAINT IF EXISTS "business_subscriptions_business_fkey";
    `)
    await queryRunner.query(`
      ALTER TABLE "business_subscriptions"
      DROP COLUMN IF EXISTS "metadata",
      DROP COLUMN IF EXISTS "grace_period_ends_at";
    `)
    await queryRunner.query(`
      ALTER TABLE "plans"
      DROP COLUMN IF EXISTS "sort_order",
      DROP COLUMN IF EXISTS "is_active",
      DROP COLUMN IF EXISTS "grace_period_days",
      DROP COLUMN IF EXISTS "billing_period_days",
      DROP COLUMN IF EXISTS "description";
    `)
  }
}
