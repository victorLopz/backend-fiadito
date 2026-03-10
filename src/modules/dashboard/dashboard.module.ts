import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "src/modules/auth/auth.module"
import { GetAccountsReceivableUseCase } from "src/modules/dashboard/application/use-cases/get-accounts-receivable.use-case"
import { GetDashboardSummaryUseCase } from "src/modules/dashboard/application/use-cases/get-dashboard-summary.use-case"
import { GetWeeklySalesUseCase } from "src/modules/dashboard/application/use-cases/get-weekly-sales.use-case"
import { DASHBOARD_REPOSITORY } from "src/modules/dashboard/domain/repositories/dashboard.repository"
import { DashboardTypeOrmRepository } from "src/modules/dashboard/infrastructure/repositories/dashboard.typeorm.repository"
import { DashboardController } from "src/modules/dashboard/presentation/controllers/dashboard.controller"
import { ClientTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/client.typeorm-entity"
import { CustomerTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/customers.typeorm-entity"
import { DebtTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/debt.typeorm-entity"
import { SaleTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/sale.typeorm-entity"

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      SaleTypeOrmEntity,
      DebtTypeOrmEntity,
      CustomerTypeOrmEntity,
      ClientTypeOrmEntity
    ])
  ],
  controllers: [DashboardController],
  providers: [
    GetDashboardSummaryUseCase,
    GetWeeklySalesUseCase,
    GetAccountsReceivableUseCase,
    DashboardTypeOrmRepository,
    { provide: DASHBOARD_REPOSITORY, useExisting: DashboardTypeOrmRepository }
  ],
  exports: [
    GetDashboardSummaryUseCase,
    GetWeeklySalesUseCase,
    GetAccountsReceivableUseCase
  ]
})
export class DashboardModule {}
