import { Injectable } from "@nestjs/common"
import { Money } from "src/shared/domain/value-objects/money.vo"
import { Invoice } from "../aggregates/invoice.aggregate"
import { InvoiceItem } from "../entities/invoice-item.entity"
import { ClientReference } from "../value-objects/client-reference.vo"
import { Tax } from "../value-objects/tax.vo"

export type InvoiceFactoryItemInput = {
  saleItemId: string
  description: string
  quantity: number
  unitPrice: number
  taxCode: string
  taxRate: number
}

export type InvoiceFactoryInput = {
  businessId: string
  saleId: string
  clientReference: string
  currency: string
  issuedAt: Date
  items: InvoiceFactoryItemInput[]
}

@Injectable()
export class InvoiceFactory {
  build(input: InvoiceFactoryInput): Invoice {
    const items = input.items.map((item) =>
      InvoiceItem.create({
        saleItemId: item.saleItemId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: new Money(item.unitPrice),
        tax: Tax.create({ code: item.taxCode, rate: item.taxRate })
      })
    )

    return Invoice.create({
      businessId: input.businessId,
      saleId: input.saleId,
      clientReference: ClientReference.create(input.clientReference),
      currency: input.currency,
      issuedAt: input.issuedAt,
      items
    })
  }
}
