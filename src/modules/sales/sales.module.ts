import { Module } from '@nestjs/common';
import { SalesService } from './application/use-cases/sales.service';
import { SalesController } from './presentation/controllers/sales.controller';

@Module({
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
