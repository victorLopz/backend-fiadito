import { Type } from "class-transformer"
import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator"
import { MembershipPaymentMethod } from "src/shared/infrastructure/persistence/entities/enums"

export class RenewSubscriptionDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string

  @IsOptional()
  @IsEnum(MembershipPaymentMethod)
  method?: MembershipPaymentMethod

  @IsOptional()
  @IsString()
  @MaxLength(120)
  externalReference?: string
}
