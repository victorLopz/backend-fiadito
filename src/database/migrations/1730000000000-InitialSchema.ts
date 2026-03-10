import { MigrationInterface, QueryRunner } from "typeorm"

export class InitialSchema1730000000000 implements MigrationInterface {
  name = "InitialSchema1730000000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('OWNER', 'ADMIN', 'CASHIER')`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."auth_tokens_type_enum" AS ENUM('REFRESH', 'RESET_PASSWORD')`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."otp_codes_purpose_enum" AS ENUM('LOGIN', 'PASSWORD_RESET', 'PHONE_VERIFICATION')`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_movements_movementtype_enum" AS ENUM('IN', 'OUT', 'ADJUSTMENT')`
    )
    await queryRunner.query(`CREATE TYPE "public"."sales_type_enum" AS ENUM('CASH', 'CREDIT')`)
    await queryRunner.query(
      `CREATE TYPE "public"."debts_status_enum" AS ENUM('OPEN', 'PAID', 'CANCELLED')`
    )
    await queryRunner.query(
      `CREATE TABLE "businesses" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "name" varchar(120) NOT NULL UNIQUE, "isActive" boolean NOT NULL DEFAULT true, "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now())`
    )
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "businessId" uuid NOT NULL, "email" varchar, "phone" varchar, "passwordHash" varchar NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'CASHIER', "isActive" boolean NOT NULL DEFAULT true, "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now())`
    )
    await queryRunner.query(
      `CREATE TABLE "user_sessions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "businessId" uuid NOT NULL, "userId" uuid NOT NULL, "ipAddress" varchar, "userAgent" varchar, "createdAt" timestamptz NOT NULL DEFAULT now(), "revokedAt" timestamptz)`
    )
    await queryRunner.query(
      `CREATE TABLE "auth_tokens" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "businessId" uuid NOT NULL, "userId" uuid NOT NULL, "type" "public"."auth_tokens_type_enum" NOT NULL, "tokenHash" varchar NOT NULL, "expiresAt" timestamptz NOT NULL, "revokedAt" timestamptz, "createdAt" timestamptz NOT NULL DEFAULT now())`
    )
    await queryRunner.query(
      `CREATE TABLE "otp_codes" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "businessId" uuid, "destination" varchar NOT NULL, "purpose" "public"."otp_codes_purpose_enum" NOT NULL, "codeHash" varchar NOT NULL, "attempts" int NOT NULL DEFAULT 0, "expiresAt" timestamptz NOT NULL, "consumedAt" timestamptz, "createdAt" timestamptz NOT NULL DEFAULT now())`
    )
    await queryRunner.query(
      `CREATE TABLE "plans" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "code" varchar NOT NULL UNIQUE, "productLimit" int NOT NULL, "historyDays" int NOT NULL DEFAULT 30, "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now())`
    )
    await queryRunner.query(
      `CREATE TABLE "business_subscriptions" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "businessId" uuid NOT NULL, "planId" uuid NOT NULL, "status" varchar NOT NULL, "startsAt" date NOT NULL, "endsAt" date, "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now())`
    )
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "businessId" uuid NOT NULL, "sku" varchar(64) NOT NULL, "name" varchar(150) NOT NULL, "price" numeric(14,2) NOT NULL, "cost" numeric(14,2) NOT NULL, "stock" int NOT NULL DEFAULT 0, "allowNegativeStock" boolean NOT NULL DEFAULT false, "lowStockThreshold" int NOT NULL DEFAULT 5, "isActive" boolean NOT NULL DEFAULT true, "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now())`
    )
    await queryRunner.query(
      `CREATE TABLE "inventory_movements" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "businessId" uuid NOT NULL, "productId" uuid NOT NULL, "movementType" "public"."inventory_movements_movementtype_enum" NOT NULL, "quantity" int NOT NULL, "reason" varchar, "referenceId" uuid, "createdAt" timestamptz NOT NULL DEFAULT now())`
    )
    await queryRunner.query(
      `CREATE TABLE "clients" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "businessId" uuid NOT NULL, "fullName" varchar NOT NULL, "phone" varchar, "email" varchar, "isActive" boolean NOT NULL DEFAULT true, "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now())`
    )
    await queryRunner.query(
      `CREATE TABLE "sales" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "businessId" uuid NOT NULL, "userId" uuid NOT NULL, "clientId" uuid, "type" "public"."sales_type_enum" NOT NULL, "subtotal" numeric(14,2) NOT NULL, "discountTotal" numeric(14,2) NOT NULL DEFAULT 0, "total" numeric(14,2) NOT NULL, "createdAt" timestamptz NOT NULL DEFAULT now())`
    )
    await queryRunner.query(
      `CREATE TABLE "sale_items" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "businessId" uuid NOT NULL, "saleId" uuid NOT NULL, "productId" uuid NOT NULL, "quantity" int NOT NULL, "unitPrice" numeric(14,2) NOT NULL, "unitCost" numeric(14,2) NOT NULL, "lineTotal" numeric(14,2) NOT NULL)`
    )
    await queryRunner.query(
      `CREATE TABLE "vouchers" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "businessId" uuid NOT NULL, "saleId" uuid NOT NULL UNIQUE, "imageUrl" varchar NOT NULL, "createdAt" timestamptz NOT NULL DEFAULT now())`
    )
    await queryRunner.query(
      `CREATE TABLE "debts" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "business_id" uuid NOT NULL, "sale_id" uuid NOT NULL, "client_id" uuid NOT NULL, "total_due" numeric(14,2) NOT NULL, "balance" numeric(14,2) NOT NULL, "status" "public"."debts_status_enum" NOT NULL DEFAULT 'OPEN', "due_date" date NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now())`
    )
    await queryRunner.query(
      `CREATE TABLE "debt_payments" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "businessId" uuid NOT NULL, "debtId" uuid NOT NULL, "amount" numeric(14,2) NOT NULL, "userId" uuid NOT NULL, "createdAt" timestamptz NOT NULL DEFAULT now())`
    )
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "businessId" uuid NOT NULL, "userId" uuid, "action" varchar NOT NULL, "metadata" jsonb, "createdAt" timestamptz NOT NULL DEFAULT now())`
    )
    await queryRunner.query(
      `CREATE TABLE "whatsapp_message_logs" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "businessId" uuid NOT NULL, "destination" varchar NOT NULL, "templateCode" varchar NOT NULL, "status" varchar NOT NULL DEFAULT 'PENDING', "payload" jsonb, "createdAt" timestamptz NOT NULL DEFAULT now())`
    )
    await queryRunner.query(
      `CREATE TABLE "trials" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "businessId" uuid NOT NULL, "startsAt" date NOT NULL, "endsAt" date NOT NULL, "convertedToPaid" boolean NOT NULL DEFAULT false, "createdAt" timestamptz NOT NULL DEFAULT now())`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "trials"')
    await queryRunner.query('DROP TABLE IF EXISTS "whatsapp_message_logs"')
    await queryRunner.query('DROP TABLE IF EXISTS "audit_logs"')
    await queryRunner.query('DROP TABLE IF EXISTS "debt_payments"')
    await queryRunner.query('DROP TABLE IF EXISTS "debts"')
    await queryRunner.query('DROP TABLE IF EXISTS "vouchers"')
    await queryRunner.query('DROP TABLE IF EXISTS "sale_items"')
    await queryRunner.query('DROP TABLE IF EXISTS "sales"')
    await queryRunner.query('DROP TABLE IF EXISTS "clients"')
    await queryRunner.query('DROP TABLE IF EXISTS "inventory_movements"')
    await queryRunner.query('DROP TABLE IF EXISTS "products"')
    await queryRunner.query('DROP TABLE IF EXISTS "business_subscriptions"')
    await queryRunner.query('DROP TABLE IF EXISTS "plans"')
    await queryRunner.query('DROP TABLE IF EXISTS "otp_codes"')
    await queryRunner.query('DROP TABLE IF EXISTS "auth_tokens"')
    await queryRunner.query('DROP TABLE IF EXISTS "user_sessions"')
    await queryRunner.query('DROP TABLE IF EXISTS "users"')
    await queryRunner.query('DROP TABLE IF EXISTS "businesses"')
    await queryRunner.query('DROP TYPE IF EXISTS "public"."debts_status_enum"')
    await queryRunner.query('DROP TYPE IF EXISTS "public"."sales_type_enum"')
    await queryRunner.query('DROP TYPE IF EXISTS "public"."inventory_movements_movementtype_enum"')
    await queryRunner.query('DROP TYPE IF EXISTS "public"."otp_codes_purpose_enum"')
    await queryRunner.query('DROP TYPE IF EXISTS "public"."auth_tokens_type_enum"')
    await queryRunner.query('DROP TYPE IF EXISTS "public"."users_role_enum"')
  }
}
