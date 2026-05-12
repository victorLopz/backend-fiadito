import { Customer } from "../entities/customer.entity"

export const CUSTOMER_REPOSITORY = Symbol("CUSTOMER_REPOSITORY")

export interface CustomerInvoicesFilters {
  businessId: string
  customerId: string
  page: number
  limit: number
  from?: Date
  to?: Date
  type?: string
}

export interface CustomerInvoiceSummary {
  id: string
  receiptNumber?: string
  type: string
  subtotal: number
  discountTotal: number
  total: number
  itemsCount: number
  createdAt: Date
}

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
  findForSelect(input: {
    businessId: string
    isActive?: boolean
    name?: string
  }): Promise<Customer[]>
  countActiveByBusiness(businessId: string): Promise<number>
  delete(id: string, businessId: string): Promise<void>
  countInvoicesByCustomer(input: { businessId: string; customerId: string }): Promise<number>
  findInvoicesByCustomer(
    filters: CustomerInvoicesFilters
  ): Promise<{ items: CustomerInvoiceSummary[]; total: number }>
}
