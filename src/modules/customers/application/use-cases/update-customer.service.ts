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

  async execute(id: string, dto: UpdateCustomerDto): Promise<CustomerOutput> {
    const existingCustomer = await this.customerRepository.findById(id)
    if (!existingCustomer) {
      throw new NotFoundException("Customer not found")
    }

    await this.customerRepository.update(id, {
      nombre: dto.nombre,
      telefonoWhatsApp: dto.telefonoWhatsApp,
      consentimientoVoucher: dto.consentimientoVoucher
    })

    const updatedCustomer = await this.customerRepository.findById(id)
    if (!updatedCustomer) {
      throw new NotFoundException("Customer not found")
    }

    return {
      id: updatedCustomer.id,
      nombre: updatedCustomer.nombre,
      telefonoWhatsApp: updatedCustomer.telefonoWhatsApp,
      consentimientoVoucher: updatedCustomer.consentimientoVoucher,
      createdAt: updatedCustomer.createdAt,
      updatedAt: updatedCustomer.updatedAt
    }
  }
}
