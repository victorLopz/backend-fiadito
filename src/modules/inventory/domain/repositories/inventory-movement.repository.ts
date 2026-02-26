export interface InventoryMovementRepository {
  createWithManager(manager: unknown, input: Record<string, unknown>): Promise<void>;
}
