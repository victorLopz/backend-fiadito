import { EntityManager } from "typeorm"

export const DEBT_REPOSITORY = Symbol("DEBT_REPOSITORY")

export interface CreateDebtInput {
  id: string
  businessId: string
  saleId: string
  clientId: string
  totalDue: number
  balance: number
  dueDate: string
}

export interface IDebtRepository {
  create(debt: CreateDebtInput, manager: EntityManager): Promise<void>
}
