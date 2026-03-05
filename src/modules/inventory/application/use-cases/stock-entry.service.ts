import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { StockEntryInputDto, StockEntryOutputDto } from "../../domain/dto/stock-entry.dto"
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
export class StockEntryService {
  constructor(
    @Inject(INVENTORY_ITEM_REPOSITORY)
    private readonly inventoryItemRepository: InventoryItemRepository,
    @Inject(INVENTORY_MOVEMENT_REPOSITORY)
    private readonly inventoryMovementRepository: InventoryMovementRepository
  ) {}

  async execute(businessId: string, input: StockEntryInputDto): Promise<StockEntryOutputDto> {
    if (!businessId) {
      throw new BadRequestException("businessId is required")
    }

    const item = await this.inventoryItemRepository.findById(input.productId, businessId)
    if (!item || !item.isActive) {
      throw new NotFoundException("Inventory item not found")
    }

    const newStock = item.stockCurrent + input.quantity
    await this.inventoryItemRepository.updateStock(item.id, businessId, newStock)

    const movementDate = await this.inventoryMovementRepository.create({
      businessId,
      productId: item.id,
      type: InventoryMovementType.IN,
      quantity: input.quantity,
      reason: input.reason,
      createdBy: input.createdBy
    })

    return {
      productId: item.id,
      previousStock: item.stockCurrent,
      newStock,
      movementType: InventoryMovementType.IN,
      movementQuantity: input.quantity,
      movementDate
    }
  }
}
