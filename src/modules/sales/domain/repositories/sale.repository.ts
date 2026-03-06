import { EntityManager } from "typeorm"
import { Sale } from "../entities/sale.entity"

export const SALE_REPOSITORY = Symbol("SALE_REPOSITORY")

export interface SaleHistoryFilters {
  businessId: string
  from?: Date
  to?: Date
  page: number
  limit: number
}

export interface SaleHistoryResult {
  items: Sale[]
  total: number
}

export interface ISaleRepository {
  create(sale: Sale, manager: EntityManager): Promise<Sale>
  findHistory(filters: SaleHistoryFilters): Promise<SaleHistoryResult>
}
