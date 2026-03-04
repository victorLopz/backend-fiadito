import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { ILike, Raw, Repository } from "typeorm"
import { ProductRepository } from "src/modules/inventory/domain/repositories/product.repository"
import { ProductTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product.typeorm-entity"

@Injectable()
export class TypeOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductTypeOrmEntity)
    private readonly repository: Repository<ProductTypeOrmEntity>
  ) {}

  async create(input: {
    businessId: string
    sku: string
    name: string
    barcode?: string
    price: string
    cost: string
    stockCurrent: number
    stockMin?: number
    createdBy: string
  }): Promise<ProductTypeOrmEntity> {
    return this.repository.save(
      this.repository.create({
        id: crypto.randomUUID(),
        businessId: input.businessId,
        sku: input.sku,
        name: input.name,
        barcode: input.barcode,
        price: input.price,
        cost: input.cost,
        stockCurrent: input.stockCurrent,
        stockMin: input.stockMin ?? 0,
        createdBy: input.createdBy,
        isActive: true
      })
    )
  }

  async findById(id: string, businessId: string): Promise<ProductTypeOrmEntity | null> {
    return this.repository.findOne({ where: { id, businessId } })
  }

  async update(
    id: string,
    businessId: string,
    input: Partial<ProductTypeOrmEntity>
  ): Promise<void> {
    await this.repository.update({ id, businessId }, input)
  }

  async deactivate(id: string, businessId: string): Promise<boolean> {
    const result = await this.repository.update({ id, businessId }, { isActive: false })
    return !!result.affected
  }

  async findLowStockPaginated(input: {
    businessId: string
    page: number
    limit: number
    name?: string
  }): Promise<{ items: ProductTypeOrmEntity[]; total: number }> {
    const where: Record<string, unknown> = {
      businessId: input.businessId,
      isActive: true,
      stockCurrent: Raw((alias) => `${alias} <= "stock_min"`)
    }

    if (input.name?.trim()) {
      where.name = ILike(`%${input.name.trim()}%`)
    }

    const [items, total] = await this.repository.findAndCount({
      where,
      order: { stockCurrent: "ASC", name: "ASC" },
      skip: (input.page - 1) * input.limit,
      take: input.limit
    })

    return { items, total }
  }

  async findPaginated(input: {
    businessId: string
    page: number
    limit: number
    name?: string
    minCost?: number
    maxCost?: number
  }): Promise<{ items: ProductTypeOrmEntity[]; total: number }> {
    const where: Record<string, unknown> = {
      businessId: input.businessId,
      isActive: true
    }

    if (input.name?.trim()) {
      where.name = ILike(`%${input.name.trim()}%`)
    }

    if (input.minCost !== undefined && input.maxCost !== undefined) {
      where.cost = Raw((alias) => `${alias}::numeric BETWEEN :minCost AND :maxCost`, {
        minCost: input.minCost,
        maxCost: input.maxCost
      })
    } else if (input.minCost !== undefined) {
      where.cost = Raw((alias) => `${alias}::numeric >= :minCost`, {
        minCost: input.minCost
      })
    } else if (input.maxCost !== undefined) {
      where.cost = Raw((alias) => `${alias}::numeric <= :maxCost`, {
        maxCost: input.maxCost
      })
    }

    const [items, total] = await this.repository.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip: (input.page - 1) * input.limit,
      take: input.limit
    })

    return { items, total }
  }
}
