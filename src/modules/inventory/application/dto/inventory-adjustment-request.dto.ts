import { Type } from "class-transformer"
import { IsInt, IsNotEmpty, IsString } from "class-validator"

export class InventoryAdjustmentRequestDto {
  @IsString()
  @IsNotEmpty()
  productId!: string

  @Type(() => Number)
  @IsInt()
  quantity!: number

  @IsString()
  @IsNotEmpty()
  reason!: string
}
