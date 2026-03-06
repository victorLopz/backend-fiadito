import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core"
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "./modules/auth/auth.module"
import { DebtsModule } from "./modules/debts/debts.module"
import { CustomersModule } from "./modules/customers/customers.module"
import { InventoryModule } from "./modules/inventory/inventory.module"
import { SalesModule } from "./modules/sales/sales.module"
import { JwtAuthGuard } from "./shared/common/guards/jwt-auth.guard"
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
    InventoryModule,
    SalesModule,
    DebtsModule,
    CustomersModule
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
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BusinessContextMiddleware).forRoutes("*")
  }
}
