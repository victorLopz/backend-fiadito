import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BusinessId } from 'src/shared/common/decorators';
import { SalesService } from '../../application/use-cases/sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  createSale(@Body() dto: any) {
    return this.salesService.createSale(dto);
  }

  @Get()
  listSales(@BusinessId() businessId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.salesService.listSales({ businessId, from: new Date(from), to: new Date(to) });
  }
}
