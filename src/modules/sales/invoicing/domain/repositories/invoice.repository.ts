import { Invoice } from "../aggregates/invoice.aggregate"

export const INVOICE_REPOSITORY = Symbol("INVOICE_REPOSITORY")

export interface InvoiceRepository {
  existsBySaleId(businessId: string, saleId: string): Promise<boolean>
  save(invoice: Invoice): Promise<{ id: string }>
}
