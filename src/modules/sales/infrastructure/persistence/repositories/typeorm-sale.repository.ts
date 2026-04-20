import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import {
  ISaleRepository,
  SaleDetailResult,
  SaleHistoryFilters,
  SaleHistoryResult
} from "src/modules/sales/domain/repositories/sale.repository"
import { Sale } from "src/modules/sales/domain/entities/sale.entity"
import { SaleMapper } from "src/modules/sales/infrastructure/persistence/mappers/sale.mapper"
import {
  Between,
  EntityManager,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  IsNull,
  Repository
} from "typeorm"
import { SaleItemTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/sale-item.typeorm-entity"
import { SaleTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/sale.typeorm-entity"
import { CustomerTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/customers.typeorm-entity"
import { ProductTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product.typeorm-entity"
import { SaleType } from "src/shared/infrastructure/persistence/entities/enums"

@Injectable()
export class TypeOrmSaleRepository implements ISaleRepository {
  constructor(
    @InjectRepository(SaleTypeOrmEntity)
    private readonly salesRepository: Repository<SaleTypeOrmEntity>,
    @InjectRepository(SaleItemTypeOrmEntity)
    private readonly saleItemsRepository: Repository<SaleItemTypeOrmEntity>,
    @InjectRepository(CustomerTypeOrmEntity)
    private readonly customerRepository: Repository<CustomerTypeOrmEntity>,
    @InjectRepository(ProductTypeOrmEntity)
    private readonly productRepository: Repository<ProductTypeOrmEntity>,
    private readonly saleMapper: SaleMapper
  ) {}

  async create(sale: Sale, manager: EntityManager): Promise<Sale> {
    const { saleEntity, saleItems } = this.saleMapper.toPersistence(sale)

    await manager.getRepository(SaleTypeOrmEntity).save(saleEntity)
    await manager.getRepository(SaleItemTypeOrmEntity).save(saleItems)

    return sale
  }

  async findHistory(filters: SaleHistoryFilters): Promise<SaleHistoryResult> {
    const where: FindOptionsWhere<SaleTypeOrmEntity> = {
      businessId: filters.businessId,
      isActive: true,
      deletedAt: IsNull()
    }

    if (filters.from && filters.to) {
      where.createdAt = Between(filters.from, filters.to)
    } else if (filters.from) {
      where.createdAt = MoreThanOrEqual(filters.from)
    } else if (filters.to) {
      where.createdAt = LessThanOrEqual(filters.to)
    }

    if (filters.type) {
      where.type = filters.type as SaleType
    }

    if (filters.customerName?.trim()) {
      const matchingCustomers = await this.customerRepository.find({
        where: {
          businessId: filters.businessId,
          name: ILike(`%${filters.customerName.trim()}%`)
        },
        select: {
          id: true
        }
      })

      const customerIds = matchingCustomers.map((customer) => customer.id)
      if (customerIds.length === 0) {
        return { items: [], total: 0 }
      }

      where.customerId = In(customerIds)
    }

    const [sales, total] = await this.salesRepository.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    })

    const saleIds = sales.map((sale) => sale.id)
    const saleItems =
      saleIds.length > 0
        ? await this.saleItemsRepository.find({
            where: {
              businessId: filters.businessId,
              saleId: In(saleIds)
            }
          })
        : []

    const itemsBySaleId = new Map<string, SaleItemTypeOrmEntity[]>()
    for (const item of saleItems) {
      const existing = itemsBySaleId.get(item.saleId) ?? []
      existing.push(item)
      itemsBySaleId.set(item.saleId, existing)
    }

    const customerIds = [
      ...new Set(sales.map((sale) => sale.customerId).filter((id): id is string => !!id))
    ]
    const customers =
      customerIds.length > 0
        ? await this.customerRepository.find({
            where: {
              businessId: filters.businessId,
              id: In(customerIds)
            }
          })
        : []

    const customerNameById = new Map(customers.map((customer) => [customer.id, customer.name]))

    return {
      items: sales.map((sale) => ({
        sale: this.saleMapper.toDomain(sale, itemsBySaleId.get(sale.id) ?? []),
        customerName: sale.customerId ? customerNameById.get(sale.customerId) : undefined
      })),
      total
    }
  }

  async findById(id: string, businessId: string): Promise<SaleDetailResult | null> {
    const saleEntity = await this.salesRepository.findOne({
      where: {
        id,
        businessId,
        isActive: true,
        deletedAt: IsNull()
      }
    })

    if (!saleEntity) {
      return null
    }

    const saleItems = await this.saleItemsRepository.find({
      where: {
        saleId: saleEntity.id,
        businessId
      }
    })

    const [customer, products] = await Promise.all([
      saleEntity.customerId
        ? this.customerRepository.findOne({
            where: {
              id: saleEntity.customerId,
              businessId
            }
          })
        : Promise.resolve(null),
      saleItems.length > 0
        ? this.productRepository.find({
            where: {
              businessId,
              id: In(saleItems.map((item) => item.productId))
            }
          })
        : Promise.resolve([])
    ])

    const productNameById = new Map(products.map((product) => [product.id, product.name]))

    return {
      sale: this.saleMapper.toDomain(saleEntity, saleItems),
      customerName: customer?.name,
      items: saleItems.map((item) => ({
        productId: item.productId,
        productName: productNameById.get(item.productId),
        quantity: item.quantity,
        price: Number(item.unitPrice),
        discount: Number(item.lineDiscount)
      }))
    }
  }
}
