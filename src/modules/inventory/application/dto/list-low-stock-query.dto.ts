import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '../../../../shared/common/swagger/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListLowStockQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 'arroz' })
  @IsOptional()
  @IsString()
  name?: string;
}
