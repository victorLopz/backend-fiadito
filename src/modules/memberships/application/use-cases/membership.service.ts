import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common"
import { ActivateSubscriptionDto } from "src/modules/memberships/application/dto/activate-subscription.dto"
import { ChangePlanDto } from "src/modules/memberships/application/dto/change-plan.dto"
import { ListMembershipPaymentsQueryDto } from "src/modules/memberships/application/dto/list-membership-payments-query.dto"
import { RenewSubscriptionDto } from "src/modules/memberships/application/dto/renew-subscription.dto"
import {
  BUSINESS_SUBSCRIPTION_REPOSITORY,
  BusinessSubscriptionRepository
} from "src/modules/memberships/domain/repositories/business-subscription.repository"
import {
  MEMBERSHIP_PAYMENT_REPOSITORY,
  MembershipPaymentRepository
} from "src/modules/memberships/domain/repositories/membership-payment.repository"
import {
  MEMBERSHIP_PLAN_REPOSITORY,
  MembershipPlanRepository
} from "src/modules/memberships/domain/repositories/membership-plan.repository"
import { BusinessSubscriptionTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/business-subscription.typeorm-entity"
import {
  MembershipPaymentMethod,
  MembershipPaymentStatus,
  MembershipPlanCode,
  MembershipSubscriptionStatus
} from "src/shared/infrastructure/persistence/entities/enums"
import { PlanTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/plan.typeorm-entity"

type MembershipAccessReason =
  | "ACTIVE"
  | "GRACE_PERIOD"
  | "NO_SUBSCRIPTION"
  | "EXPIRED"
  | "CANCELLED"

type MembershipPlanResponse = {
  id: string
  code: MembershipPlanCode
  name: string
  description?: string
  productLimit?: number | null
  customerLimit?: number | null
  historyDays?: number | null
  allowProductImages: boolean
  monthlyPrice: number
  billingPeriodDays: number
  gracePeriodDays: number
  isActive: boolean
}

type MembershipSubscriptionResponse = {
  id: string
  businessId: string
  status: MembershipSubscriptionStatus
  startsAt: Date
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  gracePeriodEndsAt?: Date
  cancelledAt?: Date
  lastRenewedAt?: Date
  plan?: MembershipPlanResponse
}

export type MembershipAccessResult = {
  allowed: boolean
  reason: MembershipAccessReason
  subscription?: MembershipSubscriptionResponse
}

@Injectable()
export class MembershipService {
  constructor(
    @Inject(MEMBERSHIP_PLAN_REPOSITORY)
    private readonly planRepository: MembershipPlanRepository,
    @Inject(BUSINESS_SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: BusinessSubscriptionRepository,
    @Inject(MEMBERSHIP_PAYMENT_REPOSITORY)
    private readonly paymentRepository: MembershipPaymentRepository
  ) {}

  async listPlans() {
    const plans = await this.planRepository.findActivePlans()
    return plans.map((plan) => this.toPlanResponse(plan))
  }

  async getStatus(businessId: string): Promise<MembershipAccessResult> {
    this.assertBusinessId(businessId)

    const subscription = await this.subscriptionRepository.findCurrentByBusinessId(businessId)
    if (!subscription) {
      return { allowed: false, reason: "NO_SUBSCRIPTION" }
    }

    const normalized = await this.normalizeSubscriptionStatus(subscription)
    return {
      allowed: this.hasAccess(normalized.status),
      reason: this.toAccessReason(normalized.status),
      subscription: this.toSubscriptionResponse(normalized)
    }
  }

  async assertBusinessCanAccess(businessId: string): Promise<void> {
    const status = await this.getStatus(businessId)
    if (status.allowed) {
      return
    }

    throw new UnauthorizedException({
      message: "Business membership is not active",
      reason: status.reason,
      subscription: status.subscription
    })
  }

  async getAllowedSalesHistoryStartDate(businessId: string): Promise<Date | undefined> {
    const status = await this.getStatus(businessId)
    if (!status.allowed) {
      throw new BadRequestException("Business membership is not active")
    }

    const historyDays = status.subscription?.plan?.historyDays
    if (historyDays === undefined || historyDays === null || historyDays < 0) {
      return undefined
    }

    return this.addDays(new Date(), -historyDays)
  }

  async activate(
    businessId: string,
    dto: ActivateSubscriptionDto,
    userId?: string
  ): Promise<Record<string, unknown>> {
    this.assertBusinessId(businessId)
    const plan = await this.getActivePlan(dto.planCode)
    const now = new Date()
    const periodEnd = this.addDays(now, plan.billingPeriodDays)
    const graceEnd = this.addDays(periodEnd, plan.gracePeriodDays)
    const current = await this.subscriptionRepository.findCurrentByBusinessId(businessId)

    const subscription = current
      ? await this.subscriptionRepository.update(current.id, {
          planId: plan.id,
          status: MembershipSubscriptionStatus.ACTIVE,
          startsAt: current.startsAt,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          gracePeriodEndsAt: graceEnd,
          cancelledAt: undefined,
          lastRenewedAt: now
        })
      : await this.subscriptionRepository.create({
          businessId,
          planId: plan.id,
          status: MembershipSubscriptionStatus.ACTIVE,
          startsAt: now,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          gracePeriodEndsAt: graceEnd,
          lastRenewedAt: now
        })

    await this.subscriptionRepository.markOtherSubscriptionsExpired(businessId, subscription.id)
    const payment = await this.createPayment(subscription, plan, dto, now, periodEnd, userId)

    return {
      subscription: this.toSubscriptionResponse({ ...subscription, plan }),
      payment: this.toPaymentResponse(payment)
    }
  }

  async renew(
    businessId: string,
    dto: RenewSubscriptionDto,
    userId?: string
  ): Promise<Record<string, unknown>> {
    this.assertBusinessId(businessId)
    const current = await this.subscriptionRepository.findCurrentByBusinessId(businessId)
    if (!current) {
      throw new BadRequestException("Business has no subscription to renew")
    }

    const plan = current.plan ?? (await this.planRepository.findById(current.planId))
    if (!plan) {
      throw new NotFoundException("Subscription plan not found")
    }

    const now = new Date()
    const baseStart =
      current.currentPeriodEnd && current.currentPeriodEnd.getTime() > now.getTime()
        ? current.currentPeriodEnd
        : now
    const periodEnd = this.addDays(baseStart, plan.billingPeriodDays)
    const graceEnd = this.addDays(periodEnd, plan.gracePeriodDays)

    const subscription = await this.subscriptionRepository.update(current.id, {
      status: MembershipSubscriptionStatus.ACTIVE,
      currentPeriodStart: baseStart,
      currentPeriodEnd: periodEnd,
      gracePeriodEndsAt: graceEnd,
      cancelledAt: undefined,
      lastRenewedAt: now
    })

    const payment = await this.createPayment(subscription, plan, dto, baseStart, periodEnd, userId)

    return {
      subscription: this.toSubscriptionResponse({ ...subscription, plan }),
      payment: this.toPaymentResponse(payment)
    }
  }

  async changePlan(
    businessId: string,
    dto: ChangePlanDto,
    userId?: string
  ): Promise<Record<string, unknown>> {
    this.assertBusinessId(businessId)
    const plan = await this.getActivePlan(dto.planCode)
    const current = await this.subscriptionRepository.findCurrentByBusinessId(businessId)
    if (!current) {
      return this.activate(businessId, { planCode: dto.planCode }, userId)
    }

    const now = new Date()
    const periodEnd = this.addDays(now, plan.billingPeriodDays)
    const graceEnd = this.addDays(periodEnd, plan.gracePeriodDays)
    const subscription = await this.subscriptionRepository.update(current.id, {
      planId: plan.id,
      status: MembershipSubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      gracePeriodEndsAt: graceEnd,
      cancelledAt: undefined,
      lastRenewedAt: now
    })

    const payment = await this.createPayment(subscription, plan, {}, now, periodEnd, userId)

    return {
      subscription: this.toSubscriptionResponse({ ...subscription, plan }),
      payment: this.toPaymentResponse(payment)
    }
  }

  async listPayments(businessId: string, query: ListMembershipPaymentsQueryDto) {
    this.assertBusinessId(businessId)
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const { items, total } = await this.paymentRepository.findByBusinessId({
      businessId,
      page,
      limit
    })

    return {
      data: items.map((payment) => this.toPaymentResponse(payment)),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }

  private async getActivePlan(code: MembershipPlanCode): Promise<PlanTypeOrmEntity> {
    const plan = await this.planRepository.findByCode(code)
    if (!plan) {
      throw new NotFoundException("Membership plan not found")
    }
    return plan
  }

  private async normalizeSubscriptionStatus(
    subscription: BusinessSubscriptionTypeOrmEntity
  ): Promise<BusinessSubscriptionTypeOrmEntity> {
    if (subscription.status === MembershipSubscriptionStatus.CANCELLED) {
      return subscription
    }

    const now = new Date()
    const periodEnd = subscription.currentPeriodEnd
    const graceEnd = subscription.gracePeriodEndsAt
    const nextStatus =
      periodEnd && periodEnd.getTime() >= now.getTime()
        ? MembershipSubscriptionStatus.ACTIVE
        : graceEnd && graceEnd.getTime() >= now.getTime()
          ? MembershipSubscriptionStatus.PAST_DUE
          : MembershipSubscriptionStatus.EXPIRED

    if (nextStatus === subscription.status) {
      return subscription
    }

    return this.subscriptionRepository.update(subscription.id, { status: nextStatus })
  }

  private createPayment(
    subscription: BusinessSubscriptionTypeOrmEntity,
    plan: PlanTypeOrmEntity,
    dto: RenewSubscriptionDto,
    periodStart: Date,
    periodEnd: Date,
    userId?: string
  ) {
    return this.paymentRepository.create({
      businessId: subscription.businessId,
      subscriptionId: subscription.id,
      planId: plan.id,
      amount: this.toMoney(dto.amount ?? Number(plan.monthlyPrice)),
      currency: dto.currency?.toUpperCase() ?? "NIO",
      status: MembershipPaymentStatus.PAID,
      method: dto.method ?? MembershipPaymentMethod.MANUAL,
      externalReference: dto.externalReference,
      paidAt: new Date(),
      periodStart,
      periodEnd,
      createdBy: userId
    })
  }

  private hasAccess(status: MembershipSubscriptionStatus): boolean {
    return [
      MembershipSubscriptionStatus.ACTIVE,
      MembershipSubscriptionStatus.PAST_DUE
    ].includes(status)
  }

  private toAccessReason(status: MembershipSubscriptionStatus): MembershipAccessReason {
    if (status === MembershipSubscriptionStatus.ACTIVE) return "ACTIVE"
    if (status === MembershipSubscriptionStatus.PAST_DUE) return "GRACE_PERIOD"
    if (status === MembershipSubscriptionStatus.CANCELLED) return "CANCELLED"
    return "EXPIRED"
  }

  private toPlanResponse(plan: PlanTypeOrmEntity) {
    return {
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description,
      productLimit: plan.productLimit,
      customerLimit: plan.customerLimit,
      historyDays: plan.historyDays,
      allowProductImages: plan.allowProductImages,
      monthlyPrice: Number(plan.monthlyPrice),
      billingPeriodDays: plan.billingPeriodDays,
      gracePeriodDays: plan.gracePeriodDays,
      isActive: plan.isActive
    }
  }

  private toSubscriptionResponse(subscription: BusinessSubscriptionTypeOrmEntity) {
    return {
      id: subscription.id,
      businessId: subscription.businessId,
      status: subscription.status,
      startsAt: subscription.startsAt,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      gracePeriodEndsAt: subscription.gracePeriodEndsAt,
      cancelledAt: subscription.cancelledAt,
      lastRenewedAt: subscription.lastRenewedAt,
      plan: subscription.plan ? this.toPlanResponse(subscription.plan) : undefined
    }
  }

  private toPaymentResponse(payment: {
    id: string
    businessId: string
    subscriptionId: string
    planId: string
    plan?: PlanTypeOrmEntity
    amount: string
    currency: string
    status: MembershipPaymentStatus
    method: MembershipPaymentMethod
    externalReference?: string
    paidAt?: Date
    periodStart: Date
    periodEnd: Date
    createdAt: Date
  }) {
    return {
      id: payment.id,
      businessId: payment.businessId,
      subscriptionId: payment.subscriptionId,
      planId: payment.planId,
      plan: payment.plan ? this.toPlanResponse(payment.plan) : undefined,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      externalReference: payment.externalReference,
      paidAt: payment.paidAt,
      periodStart: payment.periodStart,
      periodEnd: payment.periodEnd,
      createdAt: payment.createdAt
    }
  }

  private assertBusinessId(businessId: string): void {
    if (!businessId) {
      throw new BadRequestException("businessId is required")
    }
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date)
    next.setUTCDate(next.getUTCDate() + days)
    return next
  }

  private toMoney(value: number): string {
    return value.toFixed(2)
  }
}
