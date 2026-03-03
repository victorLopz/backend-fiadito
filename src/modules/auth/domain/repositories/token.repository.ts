import { AuthTokenTypeOrmEntity } from 'src/shared/infrastructure/persistence/entities/auth-token.typeorm-entity';

export const TOKEN_REPOSITORY = Symbol('TOKEN_REPOSITORY');

export interface TokenRepository {
  saveRefreshTokenHash(input: { businessId: string; userId: string; tokenHash: string; expiresAt: Date }): Promise<AuthTokenTypeOrmEntity>;
  findActiveRefreshTokenById(tokenId: string): Promise<AuthTokenTypeOrmEntity | null>;
  revokeToken(tokenId: string): Promise<void>;
}
