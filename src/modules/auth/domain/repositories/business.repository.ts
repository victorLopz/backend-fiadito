export const BUSINESS_REPOSITORY = Symbol('BUSINESS_REPOSITORY');

export interface BusinessRepository {
  existsByName(name: string): Promise<boolean>;
  create(input: { id: string; name: string }): Promise<{ id: string; name: string }>;
}
