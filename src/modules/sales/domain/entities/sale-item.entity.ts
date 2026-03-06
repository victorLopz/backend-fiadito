export interface SaleItemProps {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  unitCost: number
  lineDiscount: number
  ivaRate: number
  createdAt: Date
}

const roundMoney = (amount: number): number => Number(amount.toFixed(2))

export class SaleItem {
  readonly id: string
  readonly productId: string
  readonly quantity: number
  readonly unitPrice: number
  readonly unitCost: number
  readonly lineDiscount: number
  readonly ivaRate: number
  readonly createdAt: Date

  constructor(props: SaleItemProps) {
    if (!props.productId) {
      throw new Error("productId is required")
    }
    if (!Number.isInteger(props.quantity) || props.quantity <= 0) {
      throw new Error("quantity must be a positive integer")
    }
    if (props.unitPrice < 0 || props.unitCost < 0 || props.lineDiscount < 0) {
      throw new Error("Monetary values cannot be negative")
    }
    if (props.ivaRate < 0 || props.ivaRate > 1) {
      throw new Error("ivaRate must be between 0 and 1")
    }

    this.id = props.id
    this.productId = props.productId
    this.quantity = props.quantity
    this.unitPrice = roundMoney(props.unitPrice)
    this.unitCost = roundMoney(props.unitCost)
    this.lineDiscount = roundMoney(props.lineDiscount)
    this.ivaRate = props.ivaRate
    this.createdAt = props.createdAt

    if (this.lineDiscount > this.subtotal) {
      throw new Error("lineDiscount cannot exceed item subtotal")
    }
  }

  get subtotal(): number {
    return roundMoney(this.unitPrice * this.quantity)
  }

  get taxableBase(): number {
    return roundMoney(this.subtotal - this.lineDiscount)
  }

  get ivaAmount(): number {
    return roundMoney(this.taxableBase * this.ivaRate)
  }

  get lineTotal(): number {
    return roundMoney(this.taxableBase + this.ivaAmount)
  }
}
