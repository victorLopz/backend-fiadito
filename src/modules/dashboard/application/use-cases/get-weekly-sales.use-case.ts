import { Inject, Injectable } from "@nestjs/common"
import { WeeklySalesDto } from "src/modules/dashboard/domain/dto/weekly-sales.dto"
import {
  DASHBOARD_REPOSITORY,
  IDashboardRepository
} from "src/modules/dashboard/domain/repositories/dashboard.repository"

@Injectable()
export class GetWeeklySalesUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository
  ) {}

  async execute(businessId: string): Promise<WeeklySalesDto[]> {
    const weeklySales = await this.dashboardRepository.getWeeklySales(businessId)

    return weeklySales.map((entry) => new WeeklySalesDto(entry.date, entry.sales, entry.revenue))
  }
}
