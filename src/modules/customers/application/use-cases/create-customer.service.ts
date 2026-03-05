import { Inject, Injectable } from "@nestjs/common"
import { CreateCustomerDto } from "../dto/create-customer.dto"
import { CustomerOutput } from "../../domain/dto/customer.output"
import {
  CUSTOMER_REPOSITORY,
  ICustomerRepository
} from "../../domain/repositories/customer.repository"

@Injectable()
export class CreateCustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(dto: CreateCustomerDto, businessId: string): Promise<CustomerOutput> {
    const customer = await this.customerRepository.create({
      businessId,
      name: dto.name,
      whatsappE164: dto.whatsappE164,
      notes: dto.notes,
      isActive: dto.isActive
    })

    return {
      id: customer.id,
      name: customer.name,
      whatsappE164: customer.whatsappE164,
      notes: customer.notes,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }
  }
}
