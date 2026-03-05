import { Inject, Injectable } from "@nestjs/common"
import { CustomerOutput } from "../../domain/dto/customer.output"
import {
  CUSTOMER_REPOSITORY,
  ICustomerRepository
} from "../../domain/repositories/customer.repository"
import { ListCustomersQueryDto } from "../dto/list-customers-query.dto"

@Injectable()
export class GetCustomersService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(
    businessId: string,
    query: ListCustomersQueryDto
  ): Promise<{
    data: CustomerOutput[]
    page: number
    limit: number
    total: number
    totalPages: number
  }> {
    const page = query.page ?? 1
    const limit = query.limit ?? 20

    const { items, total } = await this.customerRepository.findPaginated({
      businessId,
      page,
      limit,
      name: query.name,
      whatsappE164: query.whatsappE164,
      isActive: query.isActive
    })

    return {
      data: items.map((customer) => ({
        id: customer.id,
        name: customer.name,
        whatsappE164: customer.whatsappE164,
        notes: customer.notes,
        isActive: customer.isActive,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}
