import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { DeleteSaleQueryDto } from "src/modules/sales/application/dto/delete-sale-query.dto"
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
    const sale = await saleRepo.findOne({
      where: {
        id: saleId,
        businessId
      }
    })

    if (!sale) {
      throw new NotFoundException("Sale not found")
    }

    if (sale.isActive === false) {
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
        isActive: false
      }
    )

    return {
      id: sale.id,
      action: "inactivated",
      message: "Sale inactivated successfully"
    }
  }
}
