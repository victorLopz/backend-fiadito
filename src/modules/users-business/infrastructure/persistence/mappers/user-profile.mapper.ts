import { UserProfile } from "src/modules/users-business/domain/entities/user-profile.entity"
import { UserTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/user.typeorm-entity"

export class UserProfileMapper {
  static toDomain(entity: UserTypeOrmEntity): UserProfile {
    return new UserProfile(
      entity.id,
      entity.businessId,
      entity.fullName,
      entity.email ?? null,
      entity.phoneE164 ?? null,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt
    )
  }
}
