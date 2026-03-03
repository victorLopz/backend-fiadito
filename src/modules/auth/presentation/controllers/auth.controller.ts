import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../../application/use-cases/auth.service';
import { JwtAuthGuard } from 'src/shared/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  requestOtp(@Body() body: { destinationMobile: string; purpose: string }) {
    return this.authService.requestOtp(body.destinationMobile, body.purpose);
  }

  @Post('otp/verify')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  verifyOtp(@Body() body: { destinationMobile: string; code: string; purpose: string }) {
    return this.authService.verifyOtp(body.destinationMobile, body.code, body.purpose);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  login(@Body() body: { destinationMobile: string }) {
    return this.authService.loginWithPhone(body.destinationMobile);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
