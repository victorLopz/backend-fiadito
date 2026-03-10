import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UserProfile } from "src/modules/users-business/domain/entities/user-profile.entity"
import { UserProfileRepository } from "src/modules/users-business/domain/repositories/user-profile.repository"
import { UserTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/user.typeorm-entity"
import { Repository } from "typeorm"
import { UserProfileMapper } from "../mappers/user-profile.mapper"

@Injectable()
export class TypeOrmUserProfileRepository implements UserProfileRepository {
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    private readonly repository: Repository<UserTypeOrmEntity>
  ) {}

  async findByIdAndBusiness(id: string, businessId: string): Promise<UserProfile | null> {
    const entity = await this.repository.findOne({
      where: { id, businessId }
    })

    return entity ? UserProfileMapper.toDomain(entity) : null
  }

  async update(
    id: string,
    businessId: string,
    input: { fullName?: string; email?: string; phoneE164?: string }
  ): Promise<void> {
    const payload: Partial<UserTypeOrmEntity> = {}

    if (input.fullName !== undefined) {
      payload.fullName = input.fullName
    }

    if (input.email !== undefined) {
      payload.email = input.email
    }

    if (input.phoneE164 !== undefined) {
      payload.phoneE164 = input.phoneE164
    }

    if (Object.keys(payload).length === 0) {
      return
    }

    await this.repository.update({ id, businessId }, payload)
  }
}
