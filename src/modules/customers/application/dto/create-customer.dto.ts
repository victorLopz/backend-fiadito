import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator"

export class CreateCustomerDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string

  @IsString()
  @MaxLength(30)
  telefonoWhatsApp!: string

  @IsBoolean()
  consentimientoVoucher!: boolean
}
