import { Body, Controller, Get, Patch, UnauthorizedException, UseGuards } from "@nestjs/common"
import { CurrentUser } from "src/shared/common/decorators"
import { JwtAuthGuard } from "src/shared/common/guards/jwt-auth.guard"
import { AuthUser } from "src/shared/common/interfaces"
import { UpdateBusinessDto } from "../../application/dto/update-business.dto"
import { UpdateMeDto } from "../../application/dto/update-me.dto"
import { GetBusinessService } from "../../application/use-cases/get-business.service"
import { GetMeService } from "../../application/use-cases/get-me.service"
import { UpdateBusinessService } from "../../application/use-cases/update-business.service"
import { UpdateMeService } from "../../application/use-cases/update-me.service"

@Controller()
@UseGuards(JwtAuthGuard)
export class UsersBusinessController {
  constructor(
    private readonly getMeService: GetMeService,
    private readonly updateMeService: UpdateMeService,
    private readonly getBusinessService: GetBusinessService,
    private readonly updateBusinessService: UpdateBusinessService
  ) {}

  @Get("me")
  getMe(@CurrentUser() user: AuthUser) {
    const userId = this.getUserId(user)
    return this.getMeService.execute(userId, user.businessId)
  }

  @Patch("me")
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateMeDto) {
    const userId = this.getUserId(user)
    return this.updateMeService.execute(userId, user.businessId, dto)
  }

  @Get("business")
  getBusiness(@CurrentUser() user: AuthUser) {
    return this.getBusinessService.execute(user.businessId)
  }

  @Patch("business")
  updateBusiness(@CurrentUser() user: AuthUser, @Body() dto: UpdateBusinessDto) {
    return this.updateBusinessService.execute(user.businessId, dto)
  }

  private getUserId(user: AuthUser): string {
    if (!user.id) {
      throw new UnauthorizedException("Authenticated user id is required")
    }

    return user.id
  }
}
