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
      nombre: query.nombre,
      telefonoWhatsApp: query.telefonoWhatsApp,
      consentimientoVoucher: query.consentimientoVoucher
    })

    return {
      data: items.map((customer) => ({
        id: customer.id,
        nombre: customer.nombre,
        telefonoWhatsApp: customer.telefonoWhatsApp,
        consentimientoVoucher: customer.consentimientoVoucher,
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
