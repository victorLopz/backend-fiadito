import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { BusinessProfile } from "src/modules/users-business/domain/entities/business-profile.entity"
import { BusinessProfileRepository } from "src/modules/users-business/domain/repositories/business-profile.repository"
import { BusinessTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/business.typeorm-entity"
import { Repository } from "typeorm"
import { BusinessProfileMapper } from "../mappers/business-profile.mapper"

@Injectable()
export class TypeOrmBusinessProfileRepository implements BusinessProfileRepository {
  constructor(
    @InjectRepository(BusinessTypeOrmEntity)
    private readonly repository: Repository<BusinessTypeOrmEntity>
  ) {}

  async findById(id: string): Promise<BusinessProfile | null> {
    const entity = await this.repository.findOne({ where: { id } })
    return entity ? BusinessProfileMapper.toDomain(entity) : null
  }

  async update(
    id: string,
    input: {
      legalName?: string
      logoUrl?: string
      currencyCode?: string
      countryCode?: string
      timezone?: string
      receiptPrefix?: string
      receiptNextNumber?: number
    }
  ): Promise<void> {
    const payload: Partial<BusinessTypeOrmEntity> = {}

    if (input.legalName !== undefined) {
      payload.legalName = input.legalName
    }

    if (input.logoUrl !== undefined) {
      payload.logoUrl = input.logoUrl
    }

    if (input.currencyCode !== undefined) {
      payload.currencyCode = input.currencyCode
    }

    if (input.countryCode !== undefined) {
      payload.countryCode = input.countryCode
    }

    if (input.timezone !== undefined) {
      payload.timezone = input.timezone
    }

    if (input.receiptPrefix !== undefined) {
      payload.receiptPrefix = input.receiptPrefix
    }

    if (input.receiptNextNumber !== undefined) {
      payload.receiptNextNumber = input.receiptNextNumber
    }

    if (Object.keys(payload).length === 0) {
      return
    }

    await this.repository.update({ id }, payload)
  }
}
