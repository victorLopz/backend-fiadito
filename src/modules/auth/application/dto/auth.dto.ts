import { ApiProperty, ApiPropertyOptional } from '../../../../shared/common/swagger/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { OtpPurpose, UserRole } from 'src/shared/infrastructure/persistence/entities/enums';

const E164_PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

export class CreateUserDto {
  @ApiProperty({ example: 'Mi Tienda Centro', description: 'Nombre del negocio que se creará para el usuario.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  businessName!: string;

  @ApiProperty({ example: 'Carlos Ramírez', description: 'Nombre completo del usuario.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName!: string;

  @ApiPropertyOptional({ example: 'carlos@mitienda.com', description: 'Correo del usuario (opcional si se envía teléfono).' })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({ example: '+573001234567', description: 'Teléfono en formato E.164 (opcional si se envía email).' })
  @IsOptional()
  @Matches(E164_PHONE_REGEX, { message: 'phone must be E.164' })
  phone?: string;

  @ApiProperty({ example: 'MiPassword#2026', minLength: 8, description: 'Contraseña del usuario.' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.OWNER, description: 'Rol inicial del usuario.' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class RequestOtpDto {
  @ApiProperty({ example: '+573001234567', description: 'Teléfono destino en formato E.164.' })
  @Matches(E164_PHONE_REGEX, { message: 'destinationMobile must be E.164' })
  destinationMobile!: string;

  @ApiProperty({ enum: OtpPurpose, example: OtpPurpose.LOGIN, description: 'Propósito del OTP.' })
  @IsEnum(OtpPurpose)
  purpose!: OtpPurpose;
}

export class VerifyOtpDto extends RequestOtpDto {
  @ApiProperty({ example: '123456', description: 'Código OTP de 6 dígitos.' })
  @Matches(/^\d{6}$/)
  code!: string;
}

export class LoginWithPhoneDto {
  @ApiProperty({ example: '+573001234567', description: 'Teléfono del usuario en formato E.164.' })
  @Matches(E164_PHONE_REGEX, { message: 'phone must be E.164' })
  phone!: string;

  @ApiProperty({ example: 'MiPassword#2026', description: 'Contraseña del usuario.' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: '17f5d8a7-92e2-4b45-8f79-a00664f8ad65.oP0fVfEub4V0j5eW9Xk5QvM7dM0mBCBv',
    description: 'Refresh token con formato <tokenId>.<secret>.',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
