import { BadRequestException, Injectable } from "@nestjs/common"
import { Invoice } from "../aggregates/invoice.aggregate"

@Injectable()
export class InvoiceCreationDomainService {
  ensureNoDuplicateSaleInvoice(existingInvoiceForSale: boolean): void {
    if (existingInvoiceForSale) {
      throw new BadRequestException("A sale can only have one invoice")
    }
  }

  ensureTotalsConsistency(invoice: Invoice): void {
    const { subtotal, taxTotal, total } = invoice.toPrimitives()

    if (subtotal < 0 || taxTotal < 0 || total < 0) {
      throw new BadRequestException("Invoice totals cannot be negative")
    }

    if (Number((subtotal + taxTotal).toFixed(2)) !== Number(total.toFixed(2))) {
      throw new BadRequestException("Invoice totals are inconsistent")
    }
  }
}
