import { Inject, Injectable } from "@nestjs/common"
import { ListSalesQueryDto } from "src/modules/sales/application/dto/list-sales-query.dto"
import { ISaleRepository, SALE_REPOSITORY } from "src/modules/sales/domain/repositories/sale.repository"

@Injectable()
export class ListSalesUseCase {
  constructor(
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: ISaleRepository
  ) {}

  async execute(businessId: string, query: ListSalesQueryDto): Promise<Record<string, unknown>> {
    const page = query.page ?? 1
    const limit = query.limit ?? 20

    const from = query.from ? new Date(query.from) : undefined
    const to = query.to ? new Date(query.to) : undefined

    if (to) {
      to.setHours(23, 59, 59, 999)
    }

    const { items, total } = await this.saleRepository.findHistory({
      businessId,
      from,
      to,
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
}
