import { Type } from "class-transformer"
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from "class-validator"

export class ListCustomersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number

  @IsOptional()
  @IsString()
  nombre?: string

  @IsOptional()
  @IsString()
  telefonoWhatsApp?: string

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  consentimientoVoucher?: boolean
}
