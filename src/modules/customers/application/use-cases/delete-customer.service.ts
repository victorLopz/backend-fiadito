import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import {
  CUSTOMER_REPOSITORY,
  ICustomerRepository
} from "src/modules/customers/domain/repositories/customer.repository"

@Injectable()
export class DeleteCustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(id: string, businessId: string): Promise<Record<string, unknown>> {
    const existingCustomer = await this.customerRepository.findById(id, businessId)

    if (!existingCustomer) {
      throw new NotFoundException("Customer not found")
    }

    const invoicesCount = await this.customerRepository.countInvoicesByCustomer({
      businessId,
      customerId: id
    })

    if (invoicesCount > 0) {
      if (existingCustomer.isActive) {
        await this.customerRepository.update(id, businessId, { isActive: false })
      }

      return {
        id,
        action: "inactivated",
        message: "Customer has invoices and was inactivated",
        invoicesCount
      }
    }

    await this.customerRepository.delete(id, businessId)

    return {
      id,
      action: "deleted",
      message: "Customer deleted successfully",
      invoicesCount: 0
    }
  }
}
