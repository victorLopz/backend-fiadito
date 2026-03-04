import { InventoryMovementType } from 'src/shared/infrastructure/persistence/entities/enums';

export const INVENTORY_MOVEMENT_REPOSITORY = Symbol('INVENTORY_MOVEMENT_REPOSITORY');

export interface InventoryMovementRepository {
  create(input: {
    businessId: string;
    productId: string;
    type: InventoryMovementType;
    quantity: number;
    reason?: string;
    createdBy: string;
  }): Promise<void>;
}
