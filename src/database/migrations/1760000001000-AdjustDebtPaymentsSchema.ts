import { MigrationInterface, QueryRunner } from "typeorm"

export class AdjustDebtPaymentsSchema1760000001000 implements MigrationInterface {
  name = "AdjustDebtPaymentsSchema1760000001000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.debt_payments (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        business_id uuid NOT NULL,
        debt_id uuid NOT NULL,
        amount numeric(12, 2) NOT NULL,
        paid_at timestamp with time zone NOT NULL DEFAULT now(),
        received_by uuid NULL,
        note character varying(200) NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT debt_payments_pkey PRIMARY KEY (id)
      );
    `)

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'debt_payments' AND column_name = 'businessId'
        ) THEN
          ALTER TABLE public.debt_payments RENAME COLUMN "businessId" TO business_id;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'debt_payments' AND column_name = 'debtId'
        ) THEN
          ALTER TABLE public.debt_payments RENAME COLUMN "debtId" TO debt_id;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'debt_payments' AND column_name = 'userId'
        ) THEN
          ALTER TABLE public.debt_payments RENAME COLUMN "userId" TO received_by;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'debt_payments' AND column_name = 'createdAt'
        ) THEN
          ALTER TABLE public.debt_payments RENAME COLUMN "createdAt" TO created_at;
        END IF;
      END
      $$;
    `)

    await queryRunner.query(`
      ALTER TABLE public.debt_payments
      ADD COLUMN IF NOT EXISTS paid_at timestamptz,
      ADD COLUMN IF NOT EXISTS note character varying(200) NULL;
    `)

    await queryRunner.query(`
      UPDATE public.debt_payments
      SET paid_at = COALESCE(paid_at, created_at, now())
      WHERE paid_at IS NULL;
    `)

    await queryRunner.query(`
      ALTER TABLE public.debt_payments
      ALTER COLUMN business_id SET NOT NULL,
      ALTER COLUMN debt_id SET NOT NULL,
      ALTER COLUMN amount TYPE numeric(12, 2) USING amount::numeric(12,2),
      ALTER COLUMN amount SET NOT NULL,
      ALTER COLUMN paid_at SET DEFAULT now(),
      ALTER COLUMN paid_at SET NOT NULL,
      ALTER COLUMN created_at SET DEFAULT now(),
      ALTER COLUMN created_at SET NOT NULL;
    `)

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'debt_payments_business_id_fkey'
        ) THEN
          ALTER TABLE public.debt_payments
          ADD CONSTRAINT debt_payments_business_id_fkey
          FOREIGN KEY (business_id) REFERENCES public.businesses (id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'debt_payments_debt_id_fkey'
        ) THEN
          ALTER TABLE public.debt_payments
          ADD CONSTRAINT debt_payments_debt_id_fkey
          FOREIGN KEY (debt_id) REFERENCES public.debts (id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'debt_payments_received_by_fkey'
        ) THEN
          ALTER TABLE public.debt_payments
          ADD CONSTRAINT debt_payments_received_by_fkey
          FOREIGN KEY (received_by) REFERENCES public.users (id);
        END IF;
      END
      $$;
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_debt_payments_debt_paid_at
      ON public.debt_payments USING btree (debt_id, paid_at);
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_debt_payments_business_paid_at
      ON public.debt_payments USING btree (business_id, paid_at);
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_debt_payments_business_paid_at;
    `)
    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_debt_payments_debt_paid_at;
    `)

    await queryRunner.query(`
      ALTER TABLE public.debt_payments
      DROP CONSTRAINT IF EXISTS debt_payments_received_by_fkey,
      DROP CONSTRAINT IF EXISTS debt_payments_debt_id_fkey,
      DROP CONSTRAINT IF EXISTS debt_payments_business_id_fkey;
    `)

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'debt_payments' AND column_name = 'received_by'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'debt_payments' AND column_name = 'userId'
        ) THEN
          ALTER TABLE public.debt_payments RENAME COLUMN received_by TO "userId";
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'debt_payments' AND column_name = 'created_at'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'debt_payments' AND column_name = 'createdAt'
        ) THEN
          ALTER TABLE public.debt_payments RENAME COLUMN created_at TO "createdAt";
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'debt_payments' AND column_name = 'business_id'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'debt_payments' AND column_name = 'businessId'
        ) THEN
          ALTER TABLE public.debt_payments RENAME COLUMN business_id TO "businessId";
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'debt_payments' AND column_name = 'debt_id'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'debt_payments' AND column_name = 'debtId'
        ) THEN
          ALTER TABLE public.debt_payments RENAME COLUMN debt_id TO "debtId";
        END IF;
      END
      $$;
    `)

    await queryRunner.query(`
      ALTER TABLE public.debt_payments
      DROP COLUMN IF EXISTS paid_at,
      DROP COLUMN IF EXISTS note;
    `)
  }
}
