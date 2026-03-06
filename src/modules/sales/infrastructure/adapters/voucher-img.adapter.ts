import { Injectable } from "@nestjs/common"
import { Sale } from "src/modules/sales/domain/entities/sale.entity"

export interface VoucherPayload {
  voucherNumber: string
  generatedAt: string
  saleId: string
  businessId: string
  lines: Array<{
    productId: string
    qty: number
    unitPrice: number
    discount: number
    total: number
  }>
  subtotal: number
  discountTotal: number
  total: number
}

@Injectable()
export class VoucherImgAdapter {
  generateFromSale(sale: Sale): VoucherPayload {
    return {
      voucherNumber: sale.receiptNumber ?? `V-${sale.id.slice(0, 8).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      saleId: sale.id,
      businessId: sale.businessId,
      lines: sale.items.map((item) => ({
        productId: item.productId,
        qty: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.lineDiscount,
        total: item.lineTotal
      })),
      subtotal: sale.subtotal,
      discountTotal: sale.discountTotal,
      total: sale.total
    }
  }
}
