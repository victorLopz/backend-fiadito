import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator"

export class CreateCustomerDto {
  @IsString()
  @MaxLength(120)
  name!: string

  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsappE164?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
