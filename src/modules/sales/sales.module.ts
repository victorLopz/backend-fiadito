import { Module } from "@nestjs/common"
import { SalesService } from "./application/use-cases/sales.service"
import { InvoicingModule } from "./invoicing/invoicing.module"
import { SalesController } from "./presentation/controllers/sales.controller"

@Module({
  imports: [InvoicingModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService]
})
export class SalesModule {}
