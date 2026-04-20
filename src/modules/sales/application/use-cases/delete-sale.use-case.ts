import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { DebtTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/debt.typeorm-entity"
import { DebtStatus, SaleType } from "src/shared/infrastructure/persistence/entities/enums"
import { SaleTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/sale.typeorm-entity"
import { DataSource } from "typeorm"

@Injectable()
export class DeleteSaleUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(businessId: string, saleId: string): Promise<Record<string, unknown>> {
    if (!businessId || !saleId) {
      throw new BadRequestException("businessId and saleId are required")
    }

    const saleRepo = this.dataSource.getRepository(SaleTypeOrmEntity)
    const debtRepo = this.dataSource.getRepository(DebtTypeOrmEntity)
    const sale = await saleRepo.findOne({
      where: {
        id: saleId,
        businessId
      }
    })

    if (!sale) {
      throw new NotFoundException("Sale not found")
    }

    if (sale.type === SaleType.CREDIT) {
      const debt = await debtRepo.findOne({
        where: {
          saleId,
          businessId
        }
      })

      if (debt && (debt.status === DebtStatus.OPEN || Number(debt.balance) > 0)) {
        throw new BadRequestException(
          "No se puede eliminar una venta a crédito con deuda pendiente o abierta"
        )
      }
    }

    if (sale.isActive === false) {
      if (!sale.deletedAt) {
        await saleRepo.update(
          {
            id: saleId,
            businessId
          },
          {
            deletedAt: new Date()
          }
        )
      }

      return {
        id: sale.id,
        action: "already_inactivated",
        message: "Sale is already inactive"
      }
    }

    await saleRepo.update(
      {
        id: saleId,
        businessId
      },
      {
        isActive: false,
        deletedAt: new Date()
      }
    )

    return {
      id: sale.id,
      action: "inactivated",
      message: "Sale inactivated successfully"
    }
  }
}
