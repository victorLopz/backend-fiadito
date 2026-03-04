import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '../../../../shared/common/swagger/swagger';
import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class AddDebtPaymentDto {
  @ApiProperty({ example: 25000, minimum: 0.01 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ example: 'd8a4e4d5-6bf6-4e8a-aa77-b191b7475e38', description: 'Usuario que registra el pago. Si no se envía usa el usuario autenticado.' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class ListOpenDebtsQueryDto {
  @ApiPropertyOptional({ example: '85c15b10-66fa-48bf-8df4-d7573eecce03' })
  @IsOptional()
  @IsUUID()
  businessId?: string;
}
