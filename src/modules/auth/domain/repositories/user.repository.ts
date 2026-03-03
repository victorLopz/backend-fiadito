export interface UserRepository {
  findByEmailOrPhone(identifier: string, businessId: string): Promise<Record<string, unknown> | null>;
  findById(id: string, businessId: string): Promise<Record<string, unknown> | null>;
}
