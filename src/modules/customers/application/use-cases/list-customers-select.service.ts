import { Inject, Injectable } from "@nestjs/common"
import {
  CUSTOMER_REPOSITORY,
  ICustomerRepository
} from "../../domain/repositories/customer.repository"
import { ListCustomersSelectQueryDto } from "../dto/list-customers-select-query.dto"

@Injectable()
export class ListCustomersSelectService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(
    businessId: string,
    query: ListCustomersSelectQueryDto
  ): Promise<{ data: Array<{ id: string; name: string }> }> {
    const customers = await this.customerRepository.findForSelect({
      businessId,
      isActive: query.isActive,
      name: query.name
    })

    return {
      data: customers.map((customer) => ({
        id: customer.id,
        name: customer.name
      }))
    }
  }
}
