export interface SaleRepository {
  createWithManager(manager: unknown, input: Record<string, unknown>): Promise<{ id: string }>;
  listByDateRange(businessId: string, start: Date, end: Date): Promise<Record<string, unknown>[]>;
}
