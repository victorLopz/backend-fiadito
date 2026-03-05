import { Type } from "class-transformer"
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator"

export class StockEntryRequestDto {
  @IsString()
  @IsNotEmpty()
  productId!: string

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number

  @IsOptional()
  @IsString()
  reason?: string
}
