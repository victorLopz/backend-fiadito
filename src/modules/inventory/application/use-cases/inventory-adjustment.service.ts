import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { AdjustInventoryInputDto, AdjustInventoryOutputDto } from "../../domain/dto/adjust-inventory.dto"
import {
  INVENTORY_ITEM_REPOSITORY,
  InventoryItemRepository
} from "../../domain/repositories/inventory-item.repository"
import {
  INVENTORY_MOVEMENT_REPOSITORY,
  InventoryMovementRepository
} from "../../domain/repositories/inventory-movement.repository"
import { InventoryMovementType } from "../../domain/enums/inventory-movement-type.enum"

@Injectable()
export class InventoryAdjustmentService {
  constructor(
    @Inject(INVENTORY_ITEM_REPOSITORY)
    private readonly inventoryItemRepository: InventoryItemRepository,
    @Inject(INVENTORY_MOVEMENT_REPOSITORY)
    private readonly inventoryMovementRepository: InventoryMovementRepository
  ) {}

  async execute(businessId: string, input: AdjustInventoryInputDto): Promise<AdjustInventoryOutputDto> {
    if (!businessId) {
      throw new BadRequestException("businessId is required")
    }

    const item = await this.inventoryItemRepository.findById(input.productId, businessId)
    if (!item || !item.isActive) {
      throw new NotFoundException("Inventory item not found")
    }

    const newStock = item.stockCurrent + input.quantity
    if (newStock < 0) {
      throw new BadRequestException("Inventory adjustment cannot produce negative stock")
    }

    await this.inventoryItemRepository.updateStock(item.id, businessId, newStock)

    const movementDate = await this.inventoryMovementRepository.create({
      businessId,
      productId: item.id,
      type: InventoryMovementType.ADJUSTMENT,
      quantity: input.quantity,
      reason: input.reason,
      createdBy: input.createdBy
    })

    return {
      productId: item.id,
      previousStock: item.stockCurrent,
      newStock,
      adjustedQuantity: input.quantity,
      reason: input.reason,
      movementDate
    }
  }
}
