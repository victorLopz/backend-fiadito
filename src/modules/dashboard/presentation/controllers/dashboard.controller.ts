import { Controller, Get, UseGuards } from "@nestjs/common"
import { GetAccountsReceivableUseCase } from "src/modules/dashboard/application/use-cases/get-accounts-receivable.use-case"
import { GetDashboardSummaryUseCase } from "src/modules/dashboard/application/use-cases/get-dashboard-summary.use-case"
import { GetWeeklySalesUseCase } from "src/modules/dashboard/application/use-cases/get-weekly-sales.use-case"
import { BusinessId } from "src/shared/common/decorators"
import { JwtAuthGuard } from "src/shared/common/guards/jwt-auth.guard"

@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
    private readonly getWeeklySalesUseCase: GetWeeklySalesUseCase,
    private readonly getAccountsReceivableUseCase: GetAccountsReceivableUseCase
  ) {}

  @Get("summary")
  summary(@BusinessId() businessId: string) {
    return this.getDashboardSummaryUseCase.execute(businessId)
  }

  @Get("weekly-sales")
  weeklySales(@BusinessId() businessId: string) {
    return this.getWeeklySalesUseCase.execute(businessId)
  }

  @Get("accounts-receivable")
  accountsReceivable(@BusinessId() businessId: string) {
    return this.getAccountsReceivableUseCase.execute(businessId)
  }
}
