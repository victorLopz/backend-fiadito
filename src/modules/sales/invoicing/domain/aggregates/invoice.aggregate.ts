import { BadRequestException } from "@nestjs/common"
import { Money } from "src/shared/domain/value-objects/money.vo"
import { InvoiceItem } from "../entities/invoice-item.entity"
import { ClientReference } from "../value-objects/client-reference.vo"

export type InvoiceStatus = "DRAFT" | "ISSUED"

export type InvoiceProps = {
  id?: string
  businessId: string
  saleId: string
  clientReference: ClientReference
  currency: string
  issuedAt: Date
  items: InvoiceItem[]
  status: InvoiceStatus
}

export class Invoice {
  private constructor(private readonly props: InvoiceProps) {}

  static create(props: Omit<InvoiceProps, "status"> & { status?: InvoiceStatus }): Invoice {
    if (!props.businessId?.trim()) {
      throw new BadRequestException("businessId is required")
    }

    if (!props.saleId?.trim()) {
      throw new BadRequestException("saleId is required")
    }

    if (!props.currency?.trim()) {
      throw new BadRequestException("currency is required")
    }

    if (!props.issuedAt || Number.isNaN(props.issuedAt.getTime())) {
      throw new BadRequestException("issuedAt must be a valid date")
    }

    if (!props.items.length) {
      throw new BadRequestException("invoice must contain at least one item")
    }

    return new Invoice({ ...props, status: props.status ?? "DRAFT" })
  }

  subtotal(): Money {
    return this.props.items
      .map((item) => item.subtotal())
      .reduce((total, current) => total.add(current), Money.zero())
  }

  taxTotal(): Money {
    return this.props.items
      .map((item) => item.taxAmount())
      .reduce((total, current) => total.add(current), Money.zero())
  }

  total(): Money {
    return this.subtotal().add(this.taxTotal())
  }

  issue(): void {
    if (this.props.status === "ISSUED") {
      throw new BadRequestException("invoice is already issued")
    }

    this.props.status = "ISSUED"
  }

  toPrimitives() {
    return {
      id: this.props.id,
      businessId: this.props.businessId,
      saleId: this.props.saleId,
      clientReference: this.props.clientReference.toString(),
      currency: this.props.currency,
      issuedAt: this.props.issuedAt,
      status: this.props.status,
      subtotal: this.subtotal().toNumber(),
      taxTotal: this.taxTotal().toNumber(),
      total: this.total().toNumber(),
      items: this.props.items.map((item) => item.toPrimitives())
    }
  }
}
