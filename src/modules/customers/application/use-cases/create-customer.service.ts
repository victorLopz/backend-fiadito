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

  async execute(dto: CreateCustomerDto): Promise<CustomerOutput> {
    const customer = await this.customerRepository.create({
      nombre: dto.nombre,
      telefonoWhatsApp: dto.telefonoWhatsApp,
      consentimientoVoucher: dto.consentimientoVoucher
    })

    return {
      id: customer.id,
      nombre: customer.nombre,
      telefonoWhatsApp: customer.telefonoWhatsApp,
      consentimientoVoucher: customer.consentimientoVoucher,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }
  }
}
