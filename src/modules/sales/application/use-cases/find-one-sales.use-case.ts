import { Injectable, Inject, NotFoundException } from "@nestjs/common"
import { SALE_REPOSITORY, ISaleRepository } from "../../domain/repositories/sale.repository"

@Injectable()
export class FindOneSaleUseCase {
  constructor(
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: ISaleRepository
  ) {}

  async execute(businessId: string, saleId: string): Promise<Record<string, unknown>> {
    const saleDetail = await this.saleRepository.findById(saleId, businessId)

    if (!saleDetail) {
      throw new NotFoundException("Sale not found")
    }

    const { sale, customerName, items } = saleDetail

    return {
      id: sale.id,
      receiptNumber: sale.receiptNumber,
      type: sale.type,
      customerId: sale.customerId,
      customerName,
      subtotal: sale.subtotal,
      discountTotal: sale.discountTotal,
      total: sale.total,
      itemsCount: sale.itemsCount,
      createdAt: sale.createdAt,
      items
    }
  }
}
