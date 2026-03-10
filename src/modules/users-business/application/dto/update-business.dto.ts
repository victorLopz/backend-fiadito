import { Type } from "class-transformer"
import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator"

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  legalName?: string

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currencyCode?: string

  @IsOptional()
  @IsString()
  @MaxLength(2)
  countryCode?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string

  @IsOptional()
  @IsString()
  @MaxLength(10)
  receiptPrefix?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  receiptNextNumber?: number
}
