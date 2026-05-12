import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { ListCustomerInvoicesQueryDto } from "src/modules/customers/application/dto/list-customer-invoices-query.dto"
import {
  CUSTOMER_REPOSITORY,
  ICustomerRepository
} from "src/modules/customers/domain/repositories/customer.repository"
import { MembershipService } from "src/modules/memberships/application/use-cases/membership.service"

@Injectable()
export class ListCustomerInvoicesService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    private readonly membershipService: MembershipService
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
    const requestedFrom = query.from ? new Date(query.from) : undefined
    const earliestAllowedFrom = await this.membershipService.getAllowedSalesHistoryStartDate(
      businessId
    )
    const from = this.maxDate(requestedFrom, earliestAllowedFrom)
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

  private maxDate(left?: Date, right?: Date): Date | undefined {
    if (!left) return right
    if (!right) return left
    return left.getTime() > right.getTime() ? left : right
  }
}
