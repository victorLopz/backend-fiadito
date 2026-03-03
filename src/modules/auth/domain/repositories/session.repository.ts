export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface SessionRepository {
  create(input: { businessId: string; userId: string }): Promise<void>;
}
