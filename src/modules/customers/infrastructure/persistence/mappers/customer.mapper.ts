import { Customer } from "src/modules/customers/domain/entities/customer.entity"
import { CustomerTypeOrmEntity } from "../entities/customer.typeorm-entity"

export class CustomerMapper {
  static toDomain(entity: CustomerTypeOrmEntity): Customer {
    return new Customer(
      entity.id,
      entity.businessId,
      entity.nombre,
      entity.telefonoWhatsApp,
      entity.consentimientoVoucher,
      entity.createdAt,
      entity.updatedAt
    )
  }
}
