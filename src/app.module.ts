import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './modules/auth/application/use-cases/auth.service';
import { DebtsService } from './modules/debts/application/use-cases/debts.service';
import { InventoryService } from './modules/inventory/application/use-cases/inventory.service';
import { SalesService } from './modules/sales/application/use-cases/sales.service';
import { AuthController } from './modules/auth/presentation/controllers/auth.controller';
import { DebtsController } from './modules/debts/presentation/controllers/debts.controller';
import { InventoryController } from './modules/inventory/presentation/controllers/inventory.controller';
import { SalesController } from './modules/sales/presentation/controllers/sales.controller';
import { TYPEORM_ENTITIES } from './shared/infrastructure/persistence/entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        ssl: config.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        entities: TYPEORM_ENTITIES,
        synchronize: false,
      }),
    }),
  ],
  controllers: [AuthController, InventoryController, SalesController, DebtsController],
  providers: [AuthService, InventoryService, SalesService, DebtsService],
})
export class AppModule {}
