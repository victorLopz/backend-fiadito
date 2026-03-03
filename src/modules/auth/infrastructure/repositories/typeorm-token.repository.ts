import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { TokenRepository } from "src/modules/auth/domain/repositories/token.repository";
import { AuthTokenTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/auth-token.typeorm-entity";
import { TokenType } from "src/shared/infrastructure/persistence/entities/enums";

@Injectable()
export class TypeOrmTokenRepository implements TokenRepository {
  constructor(
    @InjectRepository(AuthTokenTypeOrmEntity)
    private readonly repository: Repository<AuthTokenTypeOrmEntity>
  ) {}

  async saveRefreshTokenHash(input: {
    businessId: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<AuthTokenTypeOrmEntity> {
    return this.repository.save(
      this.repository.create({
        id: crypto.randomUUID(),
        businessId: input.businessId,
        userId: input.userId,
        type: TokenType.REFRESH,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt
      })
    );
  }

  async findActiveRefreshTokenById(
    tokenId: string
  ): Promise<AuthTokenTypeOrmEntity | null> {
    return this.repository.findOne({
      where: {
        id: tokenId,
        type: TokenType.REFRESH,
        revokedAt: IsNull()
      }
    });
  }

  async revokeToken(tokenId: string): Promise<void> {
    await this.repository.update({ id: tokenId }, { revokedAt: new Date() });
  }
}
