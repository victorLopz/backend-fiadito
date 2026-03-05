import { Customer } from "../entities/customer.entity"

export const CUSTOMER_REPOSITORY = Symbol("CUSTOMER_REPOSITORY")

export interface ICustomerRepository {
  create(input: {
    nombre?: string
    telefonoWhatsApp: string
    consentimientoVoucher: boolean
  }): Promise<Customer>
  update(id: string, input: { nombre?: string; telefonoWhatsApp?: string; consentimientoVoucher?: boolean }): Promise<void>
  findById(id: string): Promise<Customer | null>
  findPaginated(input: {
    page: number
    limit: number
    nombre?: string
    telefonoWhatsApp?: string
    consentimientoVoucher?: boolean
  }): Promise<{ items: Customer[]; total: number }>
}
