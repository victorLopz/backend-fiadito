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
    name: string
    whatsappE164?: string
    notes?: string
    isActive?: boolean
  }): Promise<Customer> {
    const saved = await this.repository.save(
      this.repository.create({
        id: crypto.randomUUID(),
        businessId: input.businessId,
        name: input.name,
        whatsappE164: input.whatsappE164 ?? null,
        notes: input.notes ?? null,
        isActive: input.isActive ?? true
      })
    )

    return CustomerMapper.toDomain(saved)
  }

  async update(
    id: string,
    businessId: string,
    input: { name?: string; whatsappE164?: string; notes?: string; isActive?: boolean }
  ): Promise<void> {
    const payload: Partial<CustomerTypeOrmEntity> = {}

    if (input.name !== undefined) {
      payload.name = input.name
    }
    if (input.whatsappE164 !== undefined) {
      payload.whatsappE164 = input.whatsappE164
    }
    if (input.notes !== undefined) {
      payload.notes = input.notes
    }
    if (input.isActive !== undefined) {
      payload.isActive = input.isActive
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
    name?: string
    whatsappE164?: string
    isActive?: boolean
  }): Promise<{ items: Customer[]; total: number }> {
    const where: Record<string, unknown> = {
      businessId: input.businessId
    }

    if (input.name?.trim()) {
      where.name = ILike(`%${input.name.trim()}%`)
    }

    if (input.whatsappE164?.trim()) {
      where.whatsappE164 = ILike(`%${input.whatsappE164.trim()}%`)
    }

    if (input.isActive !== undefined) {
      where.isActive = input.isActive
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

  async findForSelect(input: {
    businessId: string
    isActive?: boolean
    name?: string
  }): Promise<Customer[]> {
    const where: Record<string, unknown> = {
      businessId: input.businessId
    }

    if (input.isActive !== undefined) {
      where.isActive = input.isActive
    }

    if (input.name?.trim()) {
      where.name = ILike(`%${input.name.trim()}%`)
    }

    const items = await this.repository.find({
      where,
      order: { name: "ASC" }
    })

    return items.map((item) => CustomerMapper.toDomain(item))
  }
}
