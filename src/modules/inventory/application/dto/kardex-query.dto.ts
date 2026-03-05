import { Type } from "class-transformer"
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator"
import { InventoryMovementType } from "../../domain/enums/inventory-movement-type.enum"

export class KardexQueryDto {
  @IsOptional()
  @IsString()
  productId?: string

  @IsOptional()
  @IsEnum(InventoryMovementType)
  type?: InventoryMovementType

  @IsOptional()
  @IsDateString()
  fromDate?: string

  @IsOptional()
  @IsDateString()
  toDate?: string

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
}
