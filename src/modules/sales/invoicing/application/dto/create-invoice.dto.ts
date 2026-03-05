import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested
} from "class-validator"
import { Type } from "class-transformer"

class CreateInvoiceItemDto {
  @IsString()
  saleItemId!: string

  @IsString()
  @MaxLength(160)
  description!: string

  @IsNumber()
  @Min(0.0001)
  quantity!: number

  @IsNumber()
  @Min(0)
  unitPrice!: number

  @IsString()
  @MaxLength(20)
  taxCode!: string

  @IsNumber()
  @Min(0)
  taxRate!: number
}

export class CreateInvoiceDto {
  @IsString()
  saleId!: string

  @IsString()
  @MaxLength(80)
  clientReference!: string

  @IsOptional()
  @IsString()
  currency?: string

  @IsDateString()
  issuedAt!: string

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items!: CreateInvoiceItemDto[]
}
