import { BadRequestException } from "@nestjs/common"
import { Money } from "src/shared/domain/value-objects/money.vo"
import { Tax } from "../value-objects/tax.vo"

export type InvoiceItemProps = {
  saleItemId: string
  description: string
  quantity: number
  unitPrice: Money
  tax: Tax
}

export class InvoiceItem {
  private constructor(private readonly props: InvoiceItemProps) {}

  static create(props: InvoiceItemProps): InvoiceItem {
    const saleItemId = props.saleItemId?.trim()
    const description = props.description?.trim()

    if (!saleItemId) {
      throw new BadRequestException("invoiceItem.saleItemId is required")
    }

    if (!description) {
      throw new BadRequestException("invoiceItem.description is required")
    }

    if (!Number.isFinite(props.quantity) || props.quantity <= 0) {
      throw new BadRequestException("invoiceItem.quantity must be greater than 0")
    }

    return new InvoiceItem({
      ...props,
      saleItemId,
      description
    })
  }

  subtotal(): Money {
    return this.props.unitPrice.multiply(this.props.quantity)
  }

  taxAmount(): Money {
    return this.subtotal().multiply(this.props.tax.getRate())
  }

  total(): Money {
    return this.subtotal().add(this.taxAmount())
  }

  toPrimitives() {
    return {
      saleItemId: this.props.saleItemId,
      description: this.props.description,
      quantity: this.props.quantity,
      unitPrice: this.props.unitPrice.toNumber(),
      taxCode: this.props.tax.getCode(),
      taxRate: this.props.tax.getRate(),
      subtotal: this.subtotal().toNumber(),
      taxAmount: this.taxAmount().toNumber(),
      total: this.total().toNumber()
    }
  }
}
