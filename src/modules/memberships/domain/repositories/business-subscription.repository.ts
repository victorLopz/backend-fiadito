import { BusinessSubscriptionTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/business-subscription.typeorm-entity"
import { MembershipSubscriptionStatus } from "src/shared/infrastructure/persistence/entities/enums"

export const BUSINESS_SUBSCRIPTION_REPOSITORY = Symbol("BUSINESS_SUBSCRIPTION_REPOSITORY")

export interface BusinessSubscriptionRepository {
  create(input: {
    businessId: string
    planId: string
    status: MembershipSubscriptionStatus
    startsAt: Date
    currentPeriodStart: Date
    currentPeriodEnd: Date
    gracePeriodEndsAt: Date
    lastRenewedAt?: Date
    metadata?: Record<string, unknown>
  }): Promise<BusinessSubscriptionTypeOrmEntity>
  findCurrentByBusinessId(businessId: string): Promise<BusinessSubscriptionTypeOrmEntity | null>
  findByIdAndBusiness(
    id: string,
    businessId: string
  ): Promise<BusinessSubscriptionTypeOrmEntity | null>
  update(
    id: string,
    input: Partial<BusinessSubscriptionTypeOrmEntity>
  ): Promise<BusinessSubscriptionTypeOrmEntity>
  markOtherSubscriptionsExpired(businessId: string, keepSubscriptionId: string): Promise<void>
}
