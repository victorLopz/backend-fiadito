import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { MembershipService } from "src/modules/memberships/application/use-cases/membership.service"
import {
  BUSINESS_SUBSCRIPTION_REPOSITORY
} from "src/modules/memberships/domain/repositories/business-subscription.repository"
import {
  MEMBERSHIP_PAYMENT_REPOSITORY
} from "src/modules/memberships/domain/repositories/membership-payment.repository"
import {
  MEMBERSHIP_PLAN_REPOSITORY
} from "src/modules/memberships/domain/repositories/membership-plan.repository"
import { TypeOrmBusinessSubscriptionRepository } from "src/modules/memberships/infrastructure/repositories/typeorm-business-subscription.repository"
import { TypeOrmMembershipPaymentRepository } from "src/modules/memberships/infrastructure/repositories/typeorm-membership-payment.repository"
import { TypeOrmMembershipPlanRepository } from "src/modules/memberships/infrastructure/repositories/typeorm-membership-plan.repository"
import { MembershipsController } from "src/modules/memberships/presentation/controllers/memberships.controller"
import { BusinessSubscriptionTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/business-subscription.typeorm-entity"
import { MembershipPaymentTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/membership-payment.typeorm-entity"
import { PlanTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/plan.typeorm-entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlanTypeOrmEntity,
      BusinessSubscriptionTypeOrmEntity,
      MembershipPaymentTypeOrmEntity
    ])
  ],
  controllers: [MembershipsController],
  providers: [
    MembershipService,
    TypeOrmMembershipPlanRepository,
    TypeOrmBusinessSubscriptionRepository,
    TypeOrmMembershipPaymentRepository,
    { provide: MEMBERSHIP_PLAN_REPOSITORY, useExisting: TypeOrmMembershipPlanRepository },
    {
      provide: BUSINESS_SUBSCRIPTION_REPOSITORY,
      useExisting: TypeOrmBusinessSubscriptionRepository
    },
    { provide: MEMBERSHIP_PAYMENT_REPOSITORY, useExisting: TypeOrmMembershipPaymentRepository }
  ],
  exports: [MembershipService]
})
export class MembershipsModule {}
