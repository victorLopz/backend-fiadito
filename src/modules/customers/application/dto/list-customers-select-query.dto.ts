import { Type } from "class-transformer"
import { IsBoolean, IsOptional, IsString } from "class-validator"

export class ListCustomersSelectQueryDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean
}
