import { Inject, Injectable } from "@nestjs/common"
import { DashboardSummaryDto } from "src/modules/dashboard/domain/dto/dashboard-summary.dto"
import {
  DASHBOARD_REPOSITORY,
  IDashboardRepository
} from "src/modules/dashboard/domain/repositories/dashboard.repository"

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository
  ) {}

  async execute(businessId: string): Promise<DashboardSummaryDto> {
    const summary = await this.dashboardRepository.getSummary(businessId)

    return new DashboardSummaryDto(
      summary.totalSales,
      summary.totalRevenue,
      summary.totalClients,
      summary.pendingInvoices,
      summary.accountsReceivableTotal
    )
  }
}
