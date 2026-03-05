import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { CustomerTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/customers.typeorm-entity"
import { ILike, Repository } from "typeorm"
import { Customer } from "src/modules/customers/domain/entities/customer.entity"
import { ICustomerRepository } from "src/modules/customers/domain/repositories/customer.repository"
import { CustomerMapper } from "../mappers/customer.mapper"

@Injectable()
export class TypeOrmCustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerTypeOrmEntity)
    private readonly repository: Repository<CustomerTypeOrmEntity>
  ) {}

  async create(input: {
    businessId: string
    nombre?: string
    telefonoWhatsApp: string
    consentimientoVoucher: boolean
  }): Promise<Customer> {
    const saved = await this.repository.save(
      this.repository.create({
        id: crypto.randomUUID(),
        businessId: input.businessId,
        nombre: input.nombre ?? null,
        telefonoWhatsApp: input.telefonoWhatsApp,
        consentimientoVoucher: input.consentimientoVoucher
      })
    )

    return CustomerMapper.toDomain(saved)
  }

  async update(
    id: string,
    businessId: string,
    input: { nombre?: string; telefonoWhatsApp?: string; consentimientoVoucher?: boolean }
  ): Promise<void> {
    const payload: Partial<CustomerTypeOrmEntity> = {}

    if (input.nombre !== undefined) {
      payload.nombre = input.nombre
    }
    if (input.telefonoWhatsApp !== undefined) {
      payload.telefonoWhatsApp = input.telefonoWhatsApp
    }
    if (input.consentimientoVoucher !== undefined) {
      payload.consentimientoVoucher = input.consentimientoVoucher
    }

    if (Object.keys(payload).length === 0) {
      return
    }

    await this.repository.update({ id, businessId }, payload)
  }

  async findById(id: string, businessId: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({ where: { id, businessId } })
    return entity ? CustomerMapper.toDomain(entity) : null
  }

  async findPaginated(input: {
    businessId: string
    page: number
    limit: number
    nombre?: string
    telefonoWhatsApp?: string
    consentimientoVoucher?: boolean
  }): Promise<{ items: Customer[]; total: number }> {
    const where: Record<string, unknown> = {
      businessId: input.businessId
    }

    if (input.nombre?.trim()) {
      where.nombre = ILike(`%${input.nombre.trim()}%`)
    }

    if (input.telefonoWhatsApp?.trim()) {
      where.telefonoWhatsApp = ILike(`%${input.telefonoWhatsApp.trim()}%`)
    }

    if (input.consentimientoVoucher !== undefined) {
      where.consentimientoVoucher = input.consentimientoVoucher
    }

    const [items, total] = await this.repository.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip: (input.page - 1) * input.limit,
      take: input.limit
    })

    return {
      items: items.map((item) => CustomerMapper.toDomain(item)),
      total
    }
  }
}
