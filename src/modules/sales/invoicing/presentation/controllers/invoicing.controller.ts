import { Body, Controller, Post } from "@nestjs/common"
import { BusinessId } from "src/shared/common/decorators"
import { CreateInvoiceDto } from "../../application/dto/create-invoice.dto"
import { CreateInvoiceUseCase } from "../../application/use-cases/create-invoice.use-case"

@Controller("sales/invoices")
export class InvoicingController {
  constructor(private readonly createInvoiceUseCase: CreateInvoiceUseCase) {}

  @Post()
  createInvoice(@BusinessId() businessId: string, @Body() dto: CreateInvoiceDto) {
    return this.createInvoiceUseCase.execute({ businessId, dto })
  }
}
