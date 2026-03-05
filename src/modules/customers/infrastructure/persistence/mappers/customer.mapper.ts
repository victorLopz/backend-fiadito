import { Customer } from "src/modules/customers/domain/entities/customer.entity"
import { CustomerTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/customers.typeorm-entity"

export class CustomerMapper {
  static toDomain(entity: CustomerTypeOrmEntity): Customer {
    return new Customer(
      entity.id,
      entity.businessId,
      entity.name,
      entity.whatsappE164,
      entity.notes,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt
    )
  }
}
