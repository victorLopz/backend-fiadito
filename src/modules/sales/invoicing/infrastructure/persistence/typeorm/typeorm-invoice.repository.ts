import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Invoice } from "../../../domain/aggregates/invoice.aggregate"
import { InvoiceRepository } from "../../../domain/repositories/invoice.repository"
import { InvoiceItemTypeOrmEntity } from "./invoice-item.typeorm-entity"
import { InvoiceTypeOrmEntity } from "./invoice.typeorm-entity"

@Injectable()
export class TypeOrmInvoiceRepository implements InvoiceRepository {
  constructor(
    @InjectRepository(InvoiceTypeOrmEntity)
    private readonly invoiceRepository: Repository<InvoiceTypeOrmEntity>,
    @InjectRepository(InvoiceItemTypeOrmEntity)
    private readonly invoiceItemRepository: Repository<InvoiceItemTypeOrmEntity>
  ) {}

  async existsBySaleId(businessId: string, saleId: string): Promise<boolean> {
    const count = await this.invoiceRepository.count({
      where: { businessId, saleId }
    })

    return count > 0
  }

  async save(invoice: Invoice): Promise<{ id: string }> {
    const primitive = invoice.toPrimitives()
    const createdInvoice = await this.invoiceRepository.save(
      this.invoiceRepository.create({
        businessId: primitive.businessId,
        saleId: primitive.saleId,
        clientReference: primitive.clientReference,
        currency: primitive.currency,
        issuedAt: primitive.issuedAt,
        status: primitive.status,
        subtotal: primitive.subtotal.toFixed(2),
        taxTotal: primitive.taxTotal.toFixed(2),
        total: primitive.total.toFixed(2)
      })
    )

    await this.invoiceItemRepository.save(
      primitive.items.map((item) =>
        this.invoiceItemRepository.create({
          invoiceId: createdInvoice.id,
          saleItemId: item.saleItemId,
          description: item.description,
          quantity: item.quantity.toFixed(4),
          unitPrice: item.unitPrice.toFixed(2),
          taxCode: item.taxCode,
          taxRate: item.taxRate.toFixed(4),
          subtotal: item.subtotal.toFixed(2),
          taxAmount: item.taxAmount.toFixed(2),
          total: item.total.toFixed(2)
        })
      )
    )

    return { id: createdInvoice.id }
  }
}
