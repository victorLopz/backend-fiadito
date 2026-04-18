import { BusinessProfile } from "src/modules/users-business/domain/entities/business-profile.entity"
import { BusinessTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/business.typeorm-entity"

export class BusinessProfileMapper {
  static toDomain(entity: BusinessTypeOrmEntity): BusinessProfile {
    return new BusinessProfile(
      entity.id,
      entity.legalName,
      entity.logoUrl ?? null,
      entity.currencyCode ?? null,
      entity.countryCode ?? null,
      entity.timezone ?? null,
      entity.receiptPrefix ?? null,
      entity.receiptNextNumber ?? null,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt
    )
  }
}
