import { Inject, Injectable } from "@nestjs/common"
import { CreateInvoiceDto } from "../dto/create-invoice.dto"
import { INVOICE_REPOSITORY, InvoiceRepository } from "../../domain/repositories/invoice.repository"
import { InvoiceCreationDomainService } from "../../domain/services/invoice-creation.domain-service"
import { InvoiceFactory } from "../../domain/services/invoice.factory"

@Injectable()
export class CreateInvoiceUseCase {
  constructor(
    private readonly invoiceFactory: InvoiceFactory,
    private readonly invoiceCreationDomainService: InvoiceCreationDomainService,
    @Inject(INVOICE_REPOSITORY)
    private readonly invoiceRepository: InvoiceRepository
  ) {}

  async execute(input: {
    businessId: string
    dto: CreateInvoiceDto
  }): Promise<{ invoiceId: string }> {
    const invoice = this.invoiceFactory.build({
      businessId: input.businessId,
      saleId: input.dto.saleId,
      clientReference: input.dto.clientReference,
      currency: input.dto.currency ?? "PEN",
      issuedAt: new Date(input.dto.issuedAt),
      items: input.dto.items
    })

    const alreadyInvoiced = await this.invoiceRepository.existsBySaleId(
      input.businessId,
      input.dto.saleId
    )

    this.invoiceCreationDomainService.ensureNoDuplicateSaleInvoice(alreadyInvoiced)
    this.invoiceCreationDomainService.ensureTotalsConsistency(invoice)
    invoice.issue()

    const { id } = await this.invoiceRepository.save(invoice)
    return { invoiceId: id }
  }
}
