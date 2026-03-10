import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator"

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  fullName?: string

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneE164?: string
}
