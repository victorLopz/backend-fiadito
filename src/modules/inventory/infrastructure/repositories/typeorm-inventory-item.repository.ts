import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { InventoryItem } from "../../domain/entities/inventory-item.entity"
import { InventoryItemRepository } from "../../domain/repositories/inventory-item.repository"
import { ProductTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product.typeorm-entity"

@Injectable()
export class TypeOrmInventoryItemRepository implements InventoryItemRepository {
  constructor(
    @InjectRepository(ProductTypeOrmEntity)
    private readonly repository: Repository<ProductTypeOrmEntity>
  ) {}

  async findById(id: string, businessId: string): Promise<InventoryItem | null> {
    const entity = await this.repository.findOne({ where: { id, businessId } })
    if (!entity) {
      return null
    }

    return new InventoryItem(
      entity.id,
      entity.businessId,
      entity.sku,
      entity.name,
      entity.stockCurrent,
      entity.stockMin,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt
    )
  }

  async updateStock(id: string, businessId: string, stockCurrent: number): Promise<void> {
    await this.repository.update({ id, businessId }, { stockCurrent })
  }
}
