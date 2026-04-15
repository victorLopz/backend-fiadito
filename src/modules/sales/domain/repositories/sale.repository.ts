import { EntityManager } from "typeorm"
import { Sale } from "../entities/sale.entity"

export const SALE_REPOSITORY = Symbol("SALE_REPOSITORY")

export interface SaleHistoryFilters {
  businessId: string
  from?: Date
  to?: Date
  type?: string
  customerName?: string
  page: number
  limit: number
}

export interface SaleHistoryEntry {
  sale: Sale
  customerName?: string
}

export interface SaleDetailItem {
  productId: string
  productName?: string
  quantity: number
  price: number
  discount: number
}

export interface SaleDetailResult {
  sale: Sale
  customerName?: string
  items: SaleDetailItem[]
}

export interface SaleHistoryResult {
  items: SaleHistoryEntry[]
  total: number
}

export interface ISaleRepository {
  create(sale: Sale, manager: EntityManager): Promise<Sale>
  findHistory(filters: SaleHistoryFilters): Promise<SaleHistoryResult>
  findById(saleId: string, businessId: string): Promise<SaleDetailResult | null>
}
