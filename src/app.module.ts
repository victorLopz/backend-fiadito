import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core"
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "./modules/auth/auth.module"
import { DashboardModule } from "./modules/dashboard/dashboard.module"
import { DebtsModule } from "./modules/debts/debts.module"
import { CustomersModule } from "./modules/customers/customers.module"
import { InventoryModule } from "./modules/inventory/inventory.module"
import { MembershipsModule } from "./modules/memberships/memberships.module"
import { SalesModule } from "./modules/sales/sales.module"
import { UsersBusinessModule } from "./modules/users-business/users-business.module"
import { JwtAuthGuard } from "./shared/common/guards/jwt-auth.guard"
import { MembershipGuard } from "./shared/common/guards/membership.guard"
import { BusinessContextMiddleware } from "./shared/common/middlewares"
import { TYPEORM_ENTITIES } from "./shared/infrastructure/persistence/entities"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("DB_HOST"),
        port: config.get<number>("DB_PORT"),
        username: config.get<string>("DB_USERNAME"),
        password: config.get<string>("DB_PASSWORD"),
        database: config.get<string>("DB_NAME"),
        ssl: config.get<string>("DB_SSL") === "true" ? { rejectUnauthorized: false } : false,
        entities: TYPEORM_ENTITIES,
        synchronize: false
      })
    }),
    AuthModule,
    MembershipsModule,
    DashboardModule,
    InventoryModule,
    SalesModule,
    DebtsModule,
    CustomersModule,
    UsersBusinessModule
  ],
  controllers: [],
  providers: [
    BusinessContextMiddleware,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: MembershipGuard
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BusinessContextMiddleware).forRoutes("*")
  }
}
