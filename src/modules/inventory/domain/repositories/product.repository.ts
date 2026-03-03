export interface ProductRepository {
  countByBusinessId(businessId: string): Promise<number>;
  create(input: Record<string, unknown>): Promise<{ id: string }>;
  update(id: string, businessId: string, input: Record<string, unknown>): Promise<void>;
  deactivate(id: string, businessId: string): Promise<void>;
  findById(id: string, businessId: string): Promise<Record<string, unknown> | null>;
  findLowStock(businessId: string): Promise<Record<string, unknown>[]>;
}
