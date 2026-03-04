import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '../../../../shared/common/swagger/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../../application/use-cases/auth.service';
import { JwtAuthGuard } from 'src/shared/common/guards/jwt-auth.guard';
import { CreateUserDto, LoginWithPhoneDto, RefreshTokenDto, RequestOtpDto, VerifyOtpDto } from '../../application/dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('users')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Crear un usuario y su negocio' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  createUser(@Body() body: CreateUserDto) {
    return this.authService.createUser(body);
  }

  @Post('otp/request')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Solicitar OTP para login o verificación' })
  @ApiBody({ type: RequestOtpDto })
  @ApiResponse({ status: 201, description: 'OTP solicitado correctamente.' })
  requestOtp(@Body() body: RequestOtpDto) {
    return this.authService.requestOtp(body.destinationMobile, body.purpose);
  }

  @Post('otp/verify')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Validar OTP y crear sesión cuando aplique' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 201, description: 'OTP validado correctamente.' })
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.destinationMobile, body.code, body.purpose);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Iniciar sesión con teléfono y contraseña' })
  @ApiBody({ type: LoginWithPhoneDto })
  @ApiResponse({ status: 201, description: 'Login exitoso.' })
  login(@Body() body: LoginWithPhoneDto) {
    return this.authService.loginWithPhone(body.phone, body.password);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rotar refresh token y emitir nuevo access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 201, description: 'Token renovado correctamente.' })
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
