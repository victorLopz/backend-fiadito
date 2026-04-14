import { MigrationInterface, QueryRunner } from "typeorm"

export class AdjustWhatsappMessageLogs1760000000000 implements MigrationInterface {
  name = "AdjustWhatsappMessageLogs1760000000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE t.typname = 'whatsapp_message_type'
            AND n.nspname = 'public'
        ) THEN
          CREATE TYPE public.whatsapp_message_type AS ENUM (
            'DEBT_REMINDER',
            'PAYMENT_REMINDER',
            'PAYMENT_CONFIRMATION',
            'SALE_RECEIPT',
            'CUSTOM'
          );
        END IF;
      END
      $$;
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.whatsapp_message_logs (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        business_id uuid NOT NULL,
        type public.whatsapp_message_type NOT NULL DEFAULT 'CUSTOM',
        client_id uuid NULL,
        sale_id uuid NULL,
        debt_id uuid NULL,
        to_phone_e164 character varying(20) NOT NULL,
        message_text text NOT NULL DEFAULT '',
        media_url text NULL,
        status character varying(30) NOT NULL DEFAULT 'CREATED',
        provider character varying(40) NULL,
        provider_message_id character varying(120) NULL,
        error_message text NULL,
        created_by uuid NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT whatsapp_message_logs_pkey PRIMARY KEY (id)
      );
    `)

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'whatsapp_message_logs' AND column_name = 'businessId'
        ) THEN
          ALTER TABLE public.whatsapp_message_logs RENAME COLUMN "businessId" TO business_id;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'whatsapp_message_logs' AND column_name = 'createdAt'
        ) THEN
          ALTER TABLE public.whatsapp_message_logs RENAME COLUMN "createdAt" TO created_at;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'whatsapp_message_logs' AND column_name = 'destination'
        ) THEN
          ALTER TABLE public.whatsapp_message_logs RENAME COLUMN destination TO to_phone_e164;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'whatsapp_message_logs' AND column_name = 'templateCode'
        ) THEN
          ALTER TABLE public.whatsapp_message_logs RENAME COLUMN "templateCode" TO template_code;
        END IF;
      END
      $$;
    `)

    await queryRunner.query(`
      ALTER TABLE public.whatsapp_message_logs
      ADD COLUMN IF NOT EXISTS type public.whatsapp_message_type,
      ADD COLUMN IF NOT EXISTS client_id uuid NULL,
      ADD COLUMN IF NOT EXISTS sale_id uuid NULL,
      ADD COLUMN IF NOT EXISTS debt_id uuid NULL,
      ADD COLUMN IF NOT EXISTS message_text text,
      ADD COLUMN IF NOT EXISTS media_url text NULL,
      ADD COLUMN IF NOT EXISTS provider character varying(40) NULL,
      ADD COLUMN IF NOT EXISTS provider_message_id character varying(120) NULL,
      ADD COLUMN IF NOT EXISTS error_message text NULL,
      ADD COLUMN IF NOT EXISTS created_by uuid NULL;
    `)

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'whatsapp_message_logs' AND column_name = 'template_code'
        ) THEN
          UPDATE public.whatsapp_message_logs
          SET type = CASE UPPER(template_code)
            WHEN 'DEBT_REMINDER' THEN 'DEBT_REMINDER'::public.whatsapp_message_type
            WHEN 'PAYMENT_REMINDER' THEN 'PAYMENT_REMINDER'::public.whatsapp_message_type
            WHEN 'PAYMENT_CONFIRMATION' THEN 'PAYMENT_CONFIRMATION'::public.whatsapp_message_type
            WHEN 'SALE_RECEIPT' THEN 'SALE_RECEIPT'::public.whatsapp_message_type
            ELSE 'CUSTOM'::public.whatsapp_message_type
          END
          WHERE type IS NULL;

          UPDATE public.whatsapp_message_logs
          SET message_text = COALESCE(NULLIF(message_text, ''), 'Template: ' || template_code)
          WHERE message_text IS NULL OR message_text = '';
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'whatsapp_message_logs' AND column_name = 'payload'
        ) THEN
          UPDATE public.whatsapp_message_logs
          SET message_text = COALESCE(NULLIF(message_text, ''), payload::text)
          WHERE message_text IS NULL OR message_text = '';
        END IF;
      END
      $$;
    `)

    await queryRunner.query(`
      UPDATE public.whatsapp_message_logs
      SET type = 'CUSTOM'
      WHERE type IS NULL;
    `)

    await queryRunner.query(`
      UPDATE public.whatsapp_message_logs
      SET message_text = COALESCE(message_text, '')
      WHERE message_text IS NULL;
    `)

    await queryRunner.query(`
      UPDATE public.whatsapp_message_logs
      SET status = 'CREATED'
      WHERE status = 'PENDING';
    `)

    await queryRunner.query(`
      ALTER TABLE public.whatsapp_message_logs
      ALTER COLUMN business_id SET NOT NULL,
      ALTER COLUMN type SET NOT NULL,
      ALTER COLUMN to_phone_e164 TYPE character varying(20) USING LEFT(to_phone_e164, 20),
      ALTER COLUMN to_phone_e164 SET NOT NULL,
      ALTER COLUMN message_text SET NOT NULL,
      ALTER COLUMN status TYPE character varying(30),
      ALTER COLUMN status SET DEFAULT 'CREATED',
      ALTER COLUMN status SET NOT NULL,
      ALTER COLUMN created_at SET DEFAULT now(),
      ALTER COLUMN created_at SET NOT NULL;
    `)

    await queryRunner.query(`
      ALTER TABLE public.whatsapp_message_logs
      DROP COLUMN IF EXISTS template_code,
      DROP COLUMN IF EXISTS payload;
    `)

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_message_logs_business_id_fkey'
        ) THEN
          ALTER TABLE public.whatsapp_message_logs
          ADD CONSTRAINT whatsapp_message_logs_business_id_fkey
          FOREIGN KEY (business_id) REFERENCES public.businesses (id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_message_logs_client_id_fkey'
        ) THEN
          ALTER TABLE public.whatsapp_message_logs
          ADD CONSTRAINT whatsapp_message_logs_client_id_fkey
          FOREIGN KEY (client_id) REFERENCES public.customers (id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_message_logs_created_by_fkey'
        ) THEN
          ALTER TABLE public.whatsapp_message_logs
          ADD CONSTRAINT whatsapp_message_logs_created_by_fkey
          FOREIGN KEY (created_by) REFERENCES public.users (id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_message_logs_debt_id_fkey'
        ) THEN
          ALTER TABLE public.whatsapp_message_logs
          ADD CONSTRAINT whatsapp_message_logs_debt_id_fkey
          FOREIGN KEY (debt_id) REFERENCES public.debts (id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_message_logs_sale_id_fkey'
        ) THEN
          ALTER TABLE public.whatsapp_message_logs
          ADD CONSTRAINT whatsapp_message_logs_sale_id_fkey
          FOREIGN KEY (sale_id) REFERENCES public.sales (id);
        END IF;
      END
      $$;
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_wa_logs_business_created
      ON public.whatsapp_message_logs USING btree (business_id, created_at);
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_wa_logs_to_created
      ON public.whatsapp_message_logs USING btree (to_phone_e164, created_at);
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_wa_logs_to_created;
    `)
    await queryRunner.query(`
      DROP INDEX IF EXISTS public.idx_wa_logs_business_created;
    `)

    await queryRunner.query(`
      ALTER TABLE public.whatsapp_message_logs
      DROP CONSTRAINT IF EXISTS whatsapp_message_logs_sale_id_fkey,
      DROP CONSTRAINT IF EXISTS whatsapp_message_logs_debt_id_fkey,
      DROP CONSTRAINT IF EXISTS whatsapp_message_logs_created_by_fkey,
      DROP CONSTRAINT IF EXISTS whatsapp_message_logs_client_id_fkey,
      DROP CONSTRAINT IF EXISTS whatsapp_message_logs_business_id_fkey;
    `)

    await queryRunner.query(`
      ALTER TABLE public.whatsapp_message_logs
      ADD COLUMN IF NOT EXISTS payload jsonb NULL,
      ADD COLUMN IF NOT EXISTS "templateCode" varchar NULL;
    `)

    await queryRunner.query(`
      UPDATE public.whatsapp_message_logs
      SET "templateCode" = type::text
      WHERE "templateCode" IS NULL;
    `)

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'whatsapp_message_logs' AND column_name = 'to_phone_e164'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'whatsapp_message_logs' AND column_name = 'destination'
        ) THEN
          ALTER TABLE public.whatsapp_message_logs RENAME COLUMN to_phone_e164 TO destination;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'whatsapp_message_logs' AND column_name = 'created_at'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'whatsapp_message_logs' AND column_name = 'createdAt'
        ) THEN
          ALTER TABLE public.whatsapp_message_logs RENAME COLUMN created_at TO "createdAt";
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'whatsapp_message_logs' AND column_name = 'business_id'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'whatsapp_message_logs' AND column_name = 'businessId'
        ) THEN
          ALTER TABLE public.whatsapp_message_logs RENAME COLUMN business_id TO "businessId";
        END IF;
      END
      $$;
    `)

    await queryRunner.query(`
      ALTER TABLE public.whatsapp_message_logs
      DROP COLUMN IF EXISTS type,
      DROP COLUMN IF EXISTS client_id,
      DROP COLUMN IF EXISTS sale_id,
      DROP COLUMN IF EXISTS debt_id,
      DROP COLUMN IF EXISTS message_text,
      DROP COLUMN IF EXISTS media_url,
      DROP COLUMN IF EXISTS provider,
      DROP COLUMN IF EXISTS provider_message_id,
      DROP COLUMN IF EXISTS error_message,
      DROP COLUMN IF EXISTS created_by;
    `)
  }
}
