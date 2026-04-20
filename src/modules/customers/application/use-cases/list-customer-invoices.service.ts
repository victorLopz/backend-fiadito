import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { ListCustomerInvoicesQueryDto } from "src/modules/customers/application/dto/list-customer-invoices-query.dto"
import {
  CUSTOMER_REPOSITORY,
  ICustomerRepository
} from "src/modules/customers/domain/repositories/customer.repository"

@Injectable()
export class ListCustomerInvoicesService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(
    customerId: string,
    businessId: string,
    query: ListCustomerInvoicesQueryDto
  ): Promise<Record<string, unknown>> {
    const customer = await this.customerRepository.findById(customerId, businessId)

    if (!customer) {
      throw new NotFoundException("Customer not found")
    }

    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const from = query.from ? new Date(query.from) : undefined
    const to = query.to ? new Date(query.to) : undefined

    if (to) {
      to.setHours(23, 59, 59, 999)
    }

    const { items, total } = await this.customerRepository.findInvoicesByCustomer({
      businessId,
      customerId,
      page,
      limit,
      from,
      to,
      type: query.type
    })

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        isActive: customer.isActive
      },
      data: items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}
