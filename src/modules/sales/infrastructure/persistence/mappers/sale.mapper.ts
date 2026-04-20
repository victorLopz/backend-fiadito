import { Injectable } from "@nestjs/common"
import { Sale } from "src/modules/sales/domain/entities/sale.entity"
import { SaleItem } from "src/modules/sales/domain/entities/sale-item.entity"
import { SaleItemTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/sale-item.typeorm-entity"
import { SaleTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/sale.typeorm-entity"

@Injectable()
export class SaleMapper {
  toPersistence(sale: Sale): {
    saleEntity: SaleTypeOrmEntity
    saleItems: SaleItemTypeOrmEntity[]
  } {
    const saleEntity: SaleTypeOrmEntity = {
      id: sale.id,
      businessId: sale.businessId,
      type: sale.type,
      createdBy: sale.createdBy,
      customerId: sale.customerId,
      notes: sale.notes,
      subtotal: sale.subtotal.toFixed(2),
      discountTotal: sale.discountTotal.toFixed(2),
      total: sale.total.toFixed(2),
      itemsCount: sale.itemsCount,
      isActive: true,
      deletedAt: null,
      receiptNumber: sale.receiptNumber,
      createdAt: sale.createdAt
    }

    const saleItems: SaleItemTypeOrmEntity[] = sale.items.map((item) => ({
      id: item.id,
      saleId: sale.id,
      businessId: sale.businessId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      unitCost: item.unitCost.toFixed(2),
      lineDiscount: item.lineDiscount.toFixed(2),
      lineTotal: item.lineTotal.toFixed(2),
      createdAt: item.createdAt
    }))

    return { saleEntity, saleItems }
  }

  toDomain(saleEntity: SaleTypeOrmEntity, saleItems: SaleItemTypeOrmEntity[]): Sale {
    const items = saleItems.map(
      (item) =>
        new SaleItem({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          unitCost: Number(item.unitCost),
          lineDiscount: Number(item.lineDiscount),
          ivaRate: 0,
          createdAt: item.createdAt
        })
    )

    return new Sale({
      id: saleEntity.id,
      businessId: saleEntity.businessId,
      type: saleEntity.type,
      createdBy: saleEntity.createdBy,
      customerId: saleEntity.customerId,
      notes: saleEntity.notes,
      receiptNumber: saleEntity.receiptNumber,
      items,
      createdAt: saleEntity.createdAt
    })
  }
}
