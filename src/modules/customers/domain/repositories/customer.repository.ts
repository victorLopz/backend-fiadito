import { Customer } from "../entities/customer.entity"

export const CUSTOMER_REPOSITORY = Symbol("CUSTOMER_REPOSITORY")

export interface ICustomerRepository {
  create(input: {
    businessId: string
    nombre?: string
    telefonoWhatsApp: string
    consentimientoVoucher: boolean
  }): Promise<Customer>
  update(
    id: string,
    businessId: string,
    input: { nombre?: string; telefonoWhatsApp?: string; consentimientoVoucher?: boolean }
  ): Promise<void>
  findById(id: string, businessId: string): Promise<Customer | null>
  findPaginated(input: {
    businessId: string
    page: number
    limit: number
    nombre?: string
    telefonoWhatsApp?: string
    consentimientoVoucher?: boolean
  }): Promise<{ items: Customer[]; total: number }>
}
