import {
  MembershipPaymentMethod,
  MembershipPaymentStatus
} from "src/shared/infrastructure/persistence/entities/enums"
import { MembershipPaymentTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/membership-payment.typeorm-entity"

export const MEMBERSHIP_PAYMENT_REPOSITORY = Symbol("MEMBERSHIP_PAYMENT_REPOSITORY")

export interface MembershipPaymentRepository {
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
  }): Promise<MembershipPaymentTypeOrmEntity>
  findByBusinessId(input: {
    businessId: string
    page: number
    limit: number
  }): Promise<{ items: MembershipPaymentTypeOrmEntity[]; total: number }>
}
