import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { UpdateCustomerDto } from "../dto/update-customer.dto"
import { CustomerOutput } from "../../domain/dto/customer.output"
import {
  CUSTOMER_REPOSITORY,
  ICustomerRepository
} from "../../domain/repositories/customer.repository"

@Injectable()
export class UpdateCustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository
  ) {}

  async execute(id: string, businessId: string, dto: UpdateCustomerDto): Promise<CustomerOutput> {
    const existingCustomer = await this.customerRepository.findById(id, businessId)
    if (!existingCustomer) {
      throw new NotFoundException("Customer not found")
    }

    await this.customerRepository.update(id, businessId, {
      name: dto.name,
      whatsappE164: dto.whatsappE164,
      notes: dto.notes,
      isActive: dto.isActive
    })

    const updatedCustomer = await this.customerRepository.findById(id, businessId)
    if (!updatedCustomer) {
      throw new NotFoundException("Customer not found")
    }

    return {
      id: updatedCustomer.id,
      name: updatedCustomer.name,
      whatsappE164: updatedCustomer.whatsappE164,
      notes: updatedCustomer.notes,
      isActive: updatedCustomer.isActive,
      createdAt: updatedCustomer.createdAt,
      updatedAt: updatedCustomer.updatedAt
    }
  }
}
