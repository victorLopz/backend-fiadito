export interface TokenRepository {
  saveRefreshTokenHash(input: { businessId: string; userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  revokeAndRotate(input: { tokenId: string; nextTokenHash: string; nextExpiresAt: Date }): Promise<void>;
}
