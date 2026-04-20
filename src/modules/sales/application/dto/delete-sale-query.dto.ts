import { Type } from "class-transformer"
import { IsBoolean, IsOptional } from "class-validator"

export class DeleteSaleQueryDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  confirm?: boolean
}
