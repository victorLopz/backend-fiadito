import { Body, Controller, Get, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { ActivateSubscriptionDto } from "src/modules/memberships/application/dto/activate-subscription.dto"
import { ChangePlanDto } from "src/modules/memberships/application/dto/change-plan.dto"
import { ListMembershipPaymentsQueryDto } from "src/modules/memberships/application/dto/list-membership-payments-query.dto"
import { RenewSubscriptionDto } from "src/modules/memberships/application/dto/renew-subscription.dto"
import { MembershipService } from "src/modules/memberships/application/use-cases/membership.service"
import { BusinessId, CurrentUser, Roles, SkipMembershipCheck } from "src/shared/common/decorators"
import { RolesGuard } from "src/shared/common/guards/roles.guard"
import { AuthUser } from "src/shared/common/interfaces"
import { UserRole } from "src/shared/infrastructure/persistence/entities/enums"

@Controller("membership")
@SkipMembershipCheck()
export class MembershipsController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get("plans")
  listPlans() {
    return this.membershipService.listPlans()
  }

  @Get("status")
  getStatus(@BusinessId() businessId: string) {
    return this.membershipService.getStatus(businessId)
  }

  @Post("activate")
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  activate(
    @BusinessId() businessId: string,
    @Body() dto: ActivateSubscriptionDto,
    @CurrentUser() user?: AuthUser
  ) {
    return this.membershipService.activate(businessId, dto, user?.id)
  }

  @Post("renew")
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  renew(
    @BusinessId() businessId: string,
    @Body() dto: RenewSubscriptionDto,
    @CurrentUser() user?: AuthUser
  ) {
    return this.membershipService.renew(businessId, dto, user?.id)
  }

  @Patch("plan")
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  changePlan(
    @BusinessId() businessId: string,
    @Body() dto: ChangePlanDto,
    @CurrentUser() user?: AuthUser
  ) {
    return this.membershipService.changePlan(businessId, dto, user?.id)
  }

  @Get("payments")
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  listPayments(
    @BusinessId() businessId: string,
    @Query() query: ListMembershipPaymentsQueryDto
  ) {
    return this.membershipService.listPayments(businessId, query)
  }
}
