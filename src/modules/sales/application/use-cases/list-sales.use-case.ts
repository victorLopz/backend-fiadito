import { Inject, Injectable } from "@nestjs/common"
import { ListSalesQueryDto } from "src/modules/sales/application/dto/list-sales-query.dto"
import { MembershipService } from "src/modules/memberships/application/use-cases/membership.service"
import {
  ISaleRepository,
  SALE_REPOSITORY
} from "src/modules/sales/domain/repositories/sale.repository"

@Injectable()
export class ListSalesUseCase {
  constructor(
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: ISaleRepository,
    private readonly membershipService: MembershipService
  ) {}

  async execute(businessId: string, query: ListSalesQueryDto): Promise<Record<string, unknown>> {
    const page = query.page ?? 1
    const limit = query.limit ?? 20

    const requestedFrom = query.from ? new Date(query.from) : undefined
    const earliestAllowedFrom = await this.membershipService.getAllowedSalesHistoryStartDate(
      businessId
    )
    const from = this.maxDate(requestedFrom, earliestAllowedFrom)
    const to = query.to ? new Date(query.to) : undefined

    const type = query.type ? query.type : undefined
    const customerName = query.customerName?.trim() ? query.customerName.trim() : undefined

    if (to) {
      to.setHours(23, 59, 59, 999)
    }

    const { items, total } = await this.saleRepository.findHistory({
      businessId,
      from,
      to,
      type,
      customerName,
      page,
      limit
    })

    return {
      data: items.map(({ sale, customerName }) => ({
        id: sale.id,
        receiptNumber: sale.receiptNumber,
        type: sale.type,
        customerId: sale.customerId,
        customerName,
        subtotal: sale.subtotal,
        discountTotal: sale.discountTotal,
        total: sale.total,
        itemsCount: sale.itemsCount,
        createdAt: sale.createdAt
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }

  private maxDate(left?: Date, right?: Date): Date | undefined {
    if (!left) return right
    if (!right) return left
    return left.getTime() > right.getTime() ? left : right
  }
}
