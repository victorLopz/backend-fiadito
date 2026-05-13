import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from "@nestjs/common"
import { Throttle } from "@nestjs/throttler"
import { AuthService } from "../../application/use-cases/auth.service"
import { ChangeSuperadminPasswordDto } from "../../application/dto/change-superadmin-password.dto"
import { ChangeSuperadminPasswordService } from "../../application/use-cases/change-superadmin-password.service"
import { Public, Roles, SkipMembershipCheck } from "src/shared/common/decorators"
import { RolesGuard } from "src/shared/common/guards/roles.guard"
import { UserRole } from "src/shared/infrastructure/persistence/entities/enums"

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly changeSuperadminPasswordService: ChangeSuperadminPasswordService
  ) {}

  @Post("users")
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  createUser(
    @Body()
    body: {
      businessName: string
      fullName: string
      email?: string
      phone: string
      password: string
      role?: UserRole
    }
  ) {
    return this.authService.createUser(body)
  }

  @Post("otp/request")
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  requestOtp(@Body() body: { destinationMobile: string; purpose: string }) {
    return this.authService.requestOtp(body.destinationMobile, body.purpose)
  }

  @Post("otp/verify")
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  verifyOtp(@Body() body: { destinationMobile: string; code: string; purpose: string }) {
    return this.authService.verifyOtp(body.destinationMobile, body.code, body.purpose)
  }

  @Post("login")
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  login(@Body() body: { destinationMobile: string; password: string }) {
    return this.authService.loginWithPhone(body.destinationMobile, body.password)
  }

  @Post("refresh")
  @Public()
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken)
  }

  @Post("superadmin/users/:userId/password")
  @SkipMembershipCheck()
  @Roles(UserRole.SUPERADMIN)
  @UseGuards(RolesGuard)
  changePasswordAsSuperadmin(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Body() body: ChangeSuperadminPasswordDto
  ) {
    return this.changeSuperadminPasswordService.execute(userId, body.newPassword)
  }
}
