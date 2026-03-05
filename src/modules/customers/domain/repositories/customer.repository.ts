import { Customer } from "../entities/customer.entity"

export const CUSTOMER_REPOSITORY = Symbol("CUSTOMER_REPOSITORY")

export interface ICustomerRepository {
  create(input: {
    businessId: string
    name: string
    whatsappE164?: string
    notes?: string
    isActive?: boolean
  }): Promise<Customer>
  update(
    id: string,
    businessId: string,
    input: { name?: string; whatsappE164?: string; notes?: string; isActive?: boolean }
  ): Promise<void>
  findById(id: string, businessId: string): Promise<Customer | null>
  findPaginated(input: {
    businessId: string
    page: number
    limit: number
    name?: string
    whatsappE164?: string
    isActive?: boolean
  }): Promise<{ items: Customer[]; total: number }>
}
