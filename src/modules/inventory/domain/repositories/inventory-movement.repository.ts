import { KardexHistoryFilterDto, KardexHistoryItemDto } from "../dto/kardex-history.dto"
import { InventoryMovementType } from "../enums/inventory-movement-type.enum"

export const INVENTORY_MOVEMENT_REPOSITORY = Symbol("INVENTORY_MOVEMENT_REPOSITORY")

export interface InventoryMovementRepository {
  create(input: {
    businessId: string
    productId: string
    type: InventoryMovementType
    quantity: number
    reason?: string
    createdBy: string
  }): Promise<Date>
  findKardex(
    businessId: string,
    filters: KardexHistoryFilterDto
  ): Promise<{ items: KardexHistoryItemDto[]; total: number }>
}
