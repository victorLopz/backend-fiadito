import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { TYPEORM_ENTITIES } from './src/shared/infrastructure/persistence/entities';

config({ path: '.env' });

const sslEnabled = process.env.DB_SSL === 'true';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  entities: TYPEORM_ENTITIES,
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: false,
});
