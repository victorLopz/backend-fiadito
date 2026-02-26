import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../../application/use-cases/auth.service';
import { JwtAuthGuard } from 'src/shared/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  requestOtp(@Body() body: { destination: string; purpose: string }) {
    return this.authService.requestOtp(body.destination, body.purpose);
  }

  @Post('otp/verify')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  verifyOtp(@Body() body: { destination: string; code: string; purpose: string }) {
    return this.authService.verifyOtp(body.destination, body.code, body.purpose);
  }

  @Post('login')
  login(@Body() body: { identifier: string; password: string }) {
    return this.authService.loginWithPassword(body.identifier, body.password);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
