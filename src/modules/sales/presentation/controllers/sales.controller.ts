import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BusinessId, CurrentUser } from 'src/shared/common/decorators';
import { SalesService } from '../../application/use-cases/sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  createSale(@Body() dto: Record<string, unknown>, @BusinessId() businessId: string, @CurrentUser() user: { id?: string } | undefined) {
    return this.salesService.createSale({ ...dto, businessId: dto.businessId ?? businessId, userId: dto.userId ?? user?.id });
  }

  @Get()
  listSales(@BusinessId() businessId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.salesService.listSales({ businessId, from: new Date(from), to: new Date(to) });
  }
}
