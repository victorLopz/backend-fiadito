import { InventoryMovementType } from "../enums/inventory-movement-type.enum"

export class InventoryMovement {
  constructor(
    public readonly id: string,
    public readonly businessId: string,
    public readonly productId: string,
    public readonly type: InventoryMovementType,
    public readonly quantity: number,
    public readonly reason: string | null,
    public readonly createdBy: string,
    public readonly createdAt: Date
  ) {}
}
