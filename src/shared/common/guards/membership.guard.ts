import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { MembershipService } from "src/modules/memberships/application/use-cases/membership.service"
import { IS_PUBLIC_KEY } from "src/shared/common/decorators/public.decorator"
import { SKIP_MEMBERSHIP_CHECK_KEY } from "src/shared/common/decorators/skip-membership-check.decorator"

@Injectable()
export class MembershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly membershipService: MembershipService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])
    if (isPublic) {
      return true
    }

    const shouldSkip = this.reflector.getAllAndOverride<boolean>(SKIP_MEMBERSHIP_CHECK_KEY, [
      context.getHandler(),
      context.getClass()
    ])
    if (shouldSkip) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const businessId = request.user?.businessId ?? request.businessId
    await this.membershipService.assertBusinessCanAccess(businessId)
    return true
  }
}
