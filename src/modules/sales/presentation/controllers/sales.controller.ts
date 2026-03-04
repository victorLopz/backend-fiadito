import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '../../../../shared/common/swagger/swagger';
import { BusinessId, CurrentUser } from 'src/shared/common/decorators';
import { AuthUser } from 'src/shared/common/interfaces';
import { CreateSaleDto, ListSalesQueryDto } from '../../application/dto/sales.dto';
import { SalesService } from '../../application/use-cases/sales.service';

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una venta y afectar inventario' })
  @ApiBody({ type: CreateSaleDto })
  @ApiResponse({ status: 201, description: 'Venta creada correctamente.' })
  createSale(@Body() dto: CreateSaleDto, @BusinessId() businessId: string, @CurrentUser() user: AuthUser) {
    return this.salesService.createSale({ ...dto, businessId: dto.businessId ?? businessId, userId: dto.userId ?? user?.id });
  }

  @Get()
  @ApiOperation({ summary: 'Listar ventas por rango de fechas' })
  @ApiResponse({ status: 200, description: 'Listado de ventas.' })
  listSales(@BusinessId() businessId: string, @Query() query: ListSalesQueryDto) {
    return this.salesService.listSales({ businessId: query.businessId ?? businessId, from: new Date(query.from), to: new Date(query.to) });
  }
}
