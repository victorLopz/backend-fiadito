import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { MembershipPaymentRepository } from "src/modules/memberships/domain/repositories/membership-payment.repository"
import {
  MembershipPaymentMethod,
  MembershipPaymentStatus
} from "src/shared/infrastructure/persistence/entities/enums"
import { MembershipPaymentTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/membership-payment.typeorm-entity"

@Injectable()
export class TypeOrmMembershipPaymentRepository implements MembershipPaymentRepository {
  constructor(
    @InjectRepository(MembershipPaymentTypeOrmEntity)
    private readonly repository: Repository<MembershipPaymentTypeOrmEntity>
  ) {}

  create(input: {
    businessId: string
    subscriptionId: string
    planId: string
    amount: string
    currency: string
    status: MembershipPaymentStatus
    method: MembershipPaymentMethod
    externalReference?: string
    paidAt?: Date
    periodStart: Date
    periodEnd: Date
    createdBy?: string
    metadata?: Record<string, unknown>
  }): Promise<MembershipPaymentTypeOrmEntity> {
    return this.repository.save(this.repository.create(input))
  }

  async findByBusinessId(input: {
    businessId: string
    page: number
    limit: number
  }): Promise<{ items: MembershipPaymentTypeOrmEntity[]; total: number }> {
    const [items, total] = await this.repository.findAndCount({
      where: { businessId: input.businessId },
      relations: { plan: true },
      order: { paidAt: "DESC", createdAt: "DESC" },
      skip: (input.page - 1) * input.limit,
      take: input.limit
    })

    return { items, total }
  }
}
