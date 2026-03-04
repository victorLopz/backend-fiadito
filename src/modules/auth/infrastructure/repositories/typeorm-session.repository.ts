import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { SessionRepository } from "src/modules/auth/domain/repositories/session.repository"
import { UserSessionTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/user-session.typeorm-entity"

@Injectable()
export class TypeOrmSessionRepository implements SessionRepository {
  constructor(
    @InjectRepository(UserSessionTypeOrmEntity)
    private readonly repository: Repository<UserSessionTypeOrmEntity>
  ) {}

  async create(input: { businessId: string; userId: string }): Promise<void> {
    await this.repository.save(
      this.repository.create({
        id: crypto.randomUUID(),
        businessId: input.businessId,
        userId: input.userId
      })
    )
  }
}
