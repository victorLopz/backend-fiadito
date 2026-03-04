import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '../../../../shared/common/swagger/swagger';
import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, ValidateNested } from 'class-validator';
import { SaleType } from 'src/shared/infrastructure/persistence/entities/enums';

export class CreateSaleItemDto {
  @ApiProperty({ example: 'b5fe9f69-c766-4b9d-8ebf-a142f3d1db53' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ example: 39900, description: 'Precio unitario opcional. Si no se envía se toma el precio actual del producto.' })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  unitPrice?: number;
}

export class CreateSaleDto {
  @ApiPropertyOptional({ example: '85c15b10-66fa-48bf-8df4-d7573eecce03', description: 'Se autocompleta desde contexto si no se envía.' })
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @ApiPropertyOptional({ example: 'd8a4e4d5-6bf6-4e8a-aa77-b191b7475e38', description: 'Se autocompleta desde el usuario autenticado si no se envía.' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ example: 'd905d7e1-87bb-45e5-a0c0-04cfd58a0bf2', description: 'Requerido cuando type=CREDIT.' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiProperty({ enum: SaleType, example: SaleType.CASH })
  @IsEnum(SaleType)
  type!: SaleType;

  @ApiPropertyOptional({ example: 5000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  discountTotal?: number;

  @ApiProperty({ type: [CreateSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[];
}

export class ListSalesQueryDto {
  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @IsDateString()
  from!: string;

  @ApiProperty({ example: '2026-01-31T23:59:59.999Z' })
  @IsDateString()
  to!: string;

  @ApiPropertyOptional({ example: '85c15b10-66fa-48bf-8df4-d7573eecce03' })
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @ApiPropertyOptional({ enum: SaleType, example: SaleType.CREDIT })
  @IsOptional()
  @IsEnum(SaleType)
  type?: SaleType;

  @ApiPropertyOptional({ example: 'd905d7e1-87bb-45e5-a0c0-04cfd58a0bf2' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ example: 'filtro texto' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}
