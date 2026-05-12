import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { In, Repository } from "typeorm"
import { BusinessSubscriptionRepository } from "src/modules/memberships/domain/repositories/business-subscription.repository"
import { BusinessSubscriptionTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/business-subscription.typeorm-entity"
import { MembershipSubscriptionStatus } from "src/shared/infrastructure/persistence/entities/enums"

@Injectable()
export class TypeOrmBusinessSubscriptionRepository implements BusinessSubscriptionRepository {
  constructor(
    @InjectRepository(BusinessSubscriptionTypeOrmEntity)
    private readonly repository: Repository<BusinessSubscriptionTypeOrmEntity>
  ) {}

  async create(input: {
    businessId: string
    planId: string
    status: MembershipSubscriptionStatus
    startsAt: Date
    currentPeriodStart: Date
    currentPeriodEnd: Date
    gracePeriodEndsAt: Date
    lastRenewedAt?: Date
    metadata?: Record<string, unknown>
  }): Promise<BusinessSubscriptionTypeOrmEntity> {
    return this.repository.save(
      this.repository.create({
        businessId: input.businessId,
        planId: input.planId,
        status: input.status,
        startsAt: input.startsAt,
        currentPeriodStart: input.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd,
        gracePeriodEndsAt: input.gracePeriodEndsAt,
        lastRenewedAt: input.lastRenewedAt,
        metadata: input.metadata
      })
    )
  }

  findCurrentByBusinessId(businessId: string): Promise<BusinessSubscriptionTypeOrmEntity | null> {
    return this.repository.findOne({
      where: {
        businessId,
        status: In([
          MembershipSubscriptionStatus.ACTIVE,
          MembershipSubscriptionStatus.PAST_DUE,
          MembershipSubscriptionStatus.EXPIRED
        ])
      },
      relations: { plan: true },
      order: { createdAt: "DESC" }
    })
  }

  findByIdAndBusiness(
    id: string,
    businessId: string
  ): Promise<BusinessSubscriptionTypeOrmEntity | null> {
    return this.repository.findOne({ where: { id, businessId }, relations: { plan: true } })
  }

  async update(
    id: string,
    input: Partial<BusinessSubscriptionTypeOrmEntity>
  ): Promise<BusinessSubscriptionTypeOrmEntity> {
    const existing = await this.repository.preload({ id, ...input })
    if (!existing) {
      throw new Error("Subscription not found before update")
    }

    await this.repository.save(existing)
    const updated = await this.repository.findOne({ where: { id }, relations: { plan: true } })
    if (!updated) {
      throw new Error("Subscription not found after update")
    }
    return updated
  }

  async markOtherSubscriptionsExpired(businessId: string, keepSubscriptionId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(BusinessSubscriptionTypeOrmEntity)
      .set({ status: MembershipSubscriptionStatus.EXPIRED })
      .where('"business_id" = :businessId', { businessId })
      .andWhere("id <> :keepSubscriptionId", { keepSubscriptionId })
      .andWhere("status IN (:...statuses)", {
        statuses: [
          MembershipSubscriptionStatus.ACTIVE,
          MembershipSubscriptionStatus.PAST_DUE
        ]
      })
      .execute()
  }
}
