import { SaleType } from "src/shared/infrastructure/persistence/entities/enums"
import { SaleItem } from "./sale-item.entity"

export interface SaleProps {
  id: string
  businessId: string
  type: SaleType
  createdBy: string
  items: SaleItem[]
  customerId?: string
  notes?: string
  receiptNumber?: string
  createdAt: Date
}

export interface SaleTotalValidation {
  subtotal?: number
  discountTotal?: number
  total?: number
}

const roundMoney = (amount: number): number => Number(amount.toFixed(2))

export class Sale {
  readonly id: string
  readonly businessId: string
  readonly type: SaleType
  readonly createdBy: string
  readonly items: SaleItem[]
  readonly customerId?: string
  readonly notes?: string
  readonly receiptNumber?: string
  readonly createdAt: Date

  constructor(props: SaleProps) {
    if (!props.businessId || !props.createdBy) {
      throw new Error("businessId and createdBy are required")
    }

    if (props.items.length === 0) {
      throw new Error("Sale must contain at least one item")
    }

    this.id = props.id
    this.businessId = props.businessId
    this.type = props.type
    this.createdBy = props.createdBy
    this.items = props.items
    this.customerId = props.customerId
    this.notes = props.notes
    this.receiptNumber = props.receiptNumber
    this.createdAt = props.createdAt
  }

  static create(props: SaleProps, expectedTotals?: SaleTotalValidation): Sale {
    const sale = new Sale(props)
    sale.validateTotals(expectedTotals)
    return sale
  }

  get subtotal(): number {
    return roundMoney(this.items.reduce((acc, item) => acc + item.subtotal, 0))
  }

  get discountTotal(): number {
    return roundMoney(this.items.reduce((acc, item) => acc + item.lineDiscount, 0))
  }

  get total(): number {
    return roundMoney(this.items.reduce((acc, item) => acc + item.lineTotal, 0))
  }

  get itemsCount(): number {
    return this.items.reduce((acc, item) => acc + item.quantity, 0)
  }

  private validateTotals(expectedTotals?: SaleTotalValidation): void {
    if (!expectedTotals) {
      return
    }

    if (expectedTotals.subtotal !== undefined && roundMoney(expectedTotals.subtotal) !== this.subtotal) {
      throw new Error("Subtotal mismatch")
    }

    if (
      expectedTotals.discountTotal !== undefined &&
      roundMoney(expectedTotals.discountTotal) !== this.discountTotal
    ) {
      throw new Error("Discount total mismatch")
    }

    if (expectedTotals.total !== undefined && roundMoney(expectedTotals.total) !== this.total) {
      throw new Error("Total mismatch")
    }
  }
}
