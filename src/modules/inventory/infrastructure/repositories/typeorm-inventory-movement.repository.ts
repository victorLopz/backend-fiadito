import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { InventoryMovementRepository } from "src/modules/inventory/domain/repositories/inventory-movement.repository"
import { InventoryMovementType } from "src/shared/infrastructure/persistence/entities/enums"
import { InventoryMovementTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/inventory-movement.typeorm-entity"

@Injectable()
export class TypeOrmInventoryMovementRepository implements InventoryMovementRepository {
  constructor(
    @InjectRepository(InventoryMovementTypeOrmEntity)
    private readonly repository: Repository<InventoryMovementTypeOrmEntity>
  ) {}

  async create(input: {
    businessId: string
    productId: string
    type: InventoryMovementType
    quantity: number
    reason?: string
    createdBy: string
  }): Promise<void> {
    await this.repository.save(
      this.repository.create({
        businessId: input.businessId,
        productId: input.productId,
        type: input.type,
        quantity: input.quantity,
        reason: input.reason,
        createdBy: input.createdBy,
        createdAt: new Date()
      })
    )
  }
}
