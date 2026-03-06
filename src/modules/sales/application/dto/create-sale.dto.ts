import { Type } from "class-transformer"
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested
} from "class-validator"
import { SaleType } from "src/shared/infrastructure/persistence/entities/enums"

class CreateSaleItemDto {
  @IsUUID()
  productId!: string

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  quantity!: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  lineDiscount?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(1)
  ivaRate?: number
}

export class CreateSaleDto {
  @IsEnum(SaleType)
  type!: SaleType

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[]

  @IsOptional()
  @IsUUID()
  customerId?: string

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  subtotal?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountTotal?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  total?: number
}

export type CreateSaleItemInputDto = CreateSaleItemDto
