import { Inject, Injectable } from "@nestjs/common"
import { AccountsReceivableDto } from "src/modules/dashboard/domain/dto/accounts-receivable.dto"
import {
  DASHBOARD_REPOSITORY,
  IDashboardRepository
} from "src/modules/dashboard/domain/repositories/dashboard.repository"

@Injectable()
export class GetAccountsReceivableUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository
  ) {}

  async execute(businessId: string): Promise<AccountsReceivableDto[]> {
    const accountsReceivable = await this.dashboardRepository.getAccountsReceivable(businessId)

    return accountsReceivable.map(
      (invoice) =>
        new AccountsReceivableDto(
          invoice.clientName,
          invoice.invoiceNumber,
          invoice.amount,
          invoice.dueDate
        )
    )
  }
}
