import { InventoryItem } from "../entities/inventory-item.entity"

export const INVENTORY_ITEM_REPOSITORY = Symbol("INVENTORY_ITEM_REPOSITORY")

export interface InventoryItemRepository {
  findById(id: string, businessId: string): Promise<InventoryItem | null>
  updateStock(id: string, businessId: string, stockCurrent: number): Promise<void>
}
