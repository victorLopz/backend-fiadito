import { BadRequestException, Inject, Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"
import { CUSTOMER_REPOSITORY, ICustomerRepository } from "src/modules/customers/domain/repositories/customer.repository"
import {
  DEBT_REPOSITORY,
  IDebtRepository
} from "src/modules/debts/domain/repositories/debt.repository"
import {
  InventoryService,
  SaleInventoryProductSnapshot
} from "src/modules/inventory/application/use-cases/inventory.service"
import {
  CreateSaleDto,
  CreateSaleItemInputDto
} from "src/modules/sales/application/dto/create-sale.dto"
import { Sale } from "src/modules/sales/domain/entities/sale.entity"
import { SaleItem } from "src/modules/sales/domain/entities/sale-item.entity"
import {
  ISaleRepository,
  SALE_REPOSITORY
} from "src/modules/sales/domain/repositories/sale.repository"
import { VoucherImgAdapter } from "src/modules/sales/infrastructure/adapters/voucher-img.adapter"
import { SaleType } from "src/shared/infrastructure/persistence/entities/enums"

@Injectable()
export class CreateSaleUseCase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: ISaleRepository,
    @Inject(DEBT_REPOSITORY)
    private readonly debtRepository: IDebtRepository,
    private readonly voucherImgAdapter: VoucherImgAdapter
  ) {}

  async execute(
    dto: CreateSaleDto,
    businessId: string,
    userId: string
  ): Promise<Record<string, unknown>> {
    if (!businessId || !userId) {
      throw new BadRequestException("businessId and userId are required")
    }

    await this.assertCreditSaleRequirements(dto, businessId)

    const createdSale = await this.dataSource.transaction(async (manager) => {
      const productsById = await this.inventoryService.getProductsSnapshotForSale(
        businessId,
        dto.items.map((item) => item.productId),
        manager
      )

      const aggregatedQuantity = this.aggregateQuantityByProduct(dto.items)
      await this.inventoryService.assertStockAvailability(businessId, aggregatedQuantity, manager)

      const now = new Date()
      const sale = Sale.create(
        {
          id: crypto.randomUUID(),
          businessId,
          createdBy: userId,
          type: dto.type,
          customerId: dto.customerId,
          notes: dto.notes,
          receiptNumber: `R-${Date.now()}`,
          createdAt: now,
          items: dto.items.map((item) =>
            this.toSaleItem(item, productsById.get(item.productId), now)
          )
        },
        {
          subtotal: dto.subtotal,
          discountTotal: dto.discountTotal,
          total: dto.total
        }
      )

      await this.saleRepository.create(sale, manager)

      if (sale.type === SaleType.CREDIT) {
        await this.debtRepository.create(
          {
            id: crypto.randomUUID(),
            businessId,
            saleId: sale.id,
            clientId: sale.customerId!,
            totalDue: sale.total,
            balance: sale.total,
            dueDate: dto.dueDate!
          },
          manager
        )
      }

      await this.inventoryService.discountStockForSale(
        businessId,
        sale.id,
        userId,
        aggregatedQuantity,
        manager
      )

      return sale
    })

    return {
      sale: {
        id: createdSale.id,
        receiptNumber: createdSale.receiptNumber,
        subtotal: createdSale.subtotal,
        discountTotal: createdSale.discountTotal,
        total: createdSale.total,
        itemsCount: createdSale.itemsCount,
        createdAt: createdSale.createdAt
      },
      voucher: this.voucherImgAdapter.generateFromSale(createdSale)
    }
  }

  private async assertCreditSaleRequirements(
    dto: CreateSaleDto,
    businessId: string
  ): Promise<void> {
    if (dto.type !== SaleType.CREDIT) {
      return
    }

    if (!dto.customerId) {
      throw new BadRequestException("customerId is required for credit sales")
    }

    if (!dto.dueDate) {
      throw new BadRequestException("dueDate is required for credit sales")
    }

    const dueDate = new Date(`${dto.dueDate}T00:00:00.000Z`)
    if (Number.isNaN(dueDate.getTime())) {
      throw new BadRequestException("dueDate must be a valid ISO date")
    }

    const today = new Date()
    const todayStart = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    )

    if (dueDate < todayStart) {
      throw new BadRequestException("dueDate cannot be in the past")
    }

    const customer = await this.customerRepository.findById(dto.customerId, businessId)
    if (!customer) {
      throw new BadRequestException("customerId does not belong to an existing customer")
    }
  }

  private toSaleItem(
    item: CreateSaleItemInputDto,
    product: SaleInventoryProductSnapshot | undefined,
    now: Date
  ): SaleItem {
    if (!product) {
      throw new BadRequestException(`Product ${item.productId} not found`)
    }

    return new SaleItem({
      id: crypto.randomUUID(),
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.price,
      unitCost: product.cost,
      lineDiscount: item.lineDiscount ?? 0,
      ivaRate: item.ivaRate ?? 0,
      createdAt: now
    })
  }

  private aggregateQuantityByProduct(items: CreateSaleItemInputDto[]): Map<string, number> {
    const quantities = new Map<string, number>()
    for (const item of items) {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity)
    }
    return quantities
  }
}
