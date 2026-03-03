import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './modules/auth/application/use-cases/auth.service';
import { BUSINESS_REPOSITORY } from './modules/auth/domain/repositories/business.repository';
import { OTP_REPOSITORY } from './modules/auth/domain/repositories/otp.repository';
import { SESSION_REPOSITORY } from './modules/auth/domain/repositories/session.repository';
import { TOKEN_REPOSITORY } from './modules/auth/domain/repositories/token.repository';
import { USER_REPOSITORY } from './modules/auth/domain/repositories/user.repository';
import { TypeOrmBusinessRepository } from './modules/auth/infrastructure/repositories/typeorm-business.repository';
import { TypeOrmOtpRepository } from './modules/auth/infrastructure/repositories/typeorm-otp.repository';
import { TypeOrmSessionRepository } from './modules/auth/infrastructure/repositories/typeorm-session.repository';
import { TypeOrmTokenRepository } from './modules/auth/infrastructure/repositories/typeorm-token.repository';
import { TypeOrmUserRepository } from './modules/auth/infrastructure/repositories/typeorm-user.repository';
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
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
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
    TypeOrmModule.forFeature(TYPEORM_ENTITIES),
  ],
  controllers: [AuthController, InventoryController, SalesController, DebtsController],
  providers: [
    AuthService,
    InventoryService,
    SalesService,
    DebtsService,
    TypeOrmUserRepository,
    TypeOrmBusinessRepository,
    TypeOrmOtpRepository,
    TypeOrmTokenRepository,
    TypeOrmSessionRepository,
    { provide: USER_REPOSITORY, useExisting: TypeOrmUserRepository },
    { provide: BUSINESS_REPOSITORY, useExisting: TypeOrmBusinessRepository },
    { provide: OTP_REPOSITORY, useExisting: TypeOrmOtpRepository },
    { provide: TOKEN_REPOSITORY, useExisting: TypeOrmTokenRepository },
    { provide: SESSION_REPOSITORY, useExisting: TypeOrmSessionRepository },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
