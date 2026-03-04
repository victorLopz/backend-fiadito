export interface DebtRepository {
  createWithManager(manager: unknown, input: Record<string, unknown>): Promise<{ id: string }>
  addPayment(input: Record<string, unknown>): Promise<void>
  findOpenDebts(businessId: string): Promise<Record<string, unknown>[]>
}
