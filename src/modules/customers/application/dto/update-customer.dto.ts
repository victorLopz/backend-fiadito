import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator"

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefonoWhatsApp?: string

  @IsOptional()
  @IsBoolean()
  consentimientoVoucher?: boolean
}
