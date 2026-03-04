import { Type } from "class-transformer"
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator"

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  sku!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string

  @IsOptional()
  @IsString()
  @MaxLength(64)
  barcode?: string

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost!: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  initialStock?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockMin?: number
}
