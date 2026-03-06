import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { ISaleRepository, SaleHistoryFilters, SaleHistoryResult } from "src/modules/sales/domain/repositories/sale.repository"
import { Sale } from "src/modules/sales/domain/entities/sale.entity"
import { SaleMapper } from "src/modules/sales/infrastructure/persistence/mappers/sale.mapper"
import { Between, EntityManager, FindOptionsWhere, In, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm"
import { SaleItemTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/sale-item.typeorm-entity"
import { SaleTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/sale.typeorm-entity"

@Injectable()
export class TypeOrmSaleRepository implements ISaleRepository {
  constructor(
    @InjectRepository(SaleTypeOrmEntity)
    private readonly salesRepository: Repository<SaleTypeOrmEntity>,
    @InjectRepository(SaleItemTypeOrmEntity)
    private readonly saleItemsRepository: Repository<SaleItemTypeOrmEntity>,
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
      businessId: filters.businessId
    }

    if (filters.from && filters.to) {
      where.createdAt = Between(filters.from, filters.to)
    } else if (filters.from) {
      where.createdAt = MoreThanOrEqual(filters.from)
    } else if (filters.to) {
      where.createdAt = LessThanOrEqual(filters.to)
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

    return {
      items: sales.map((sale) => this.saleMapper.toDomain(sale, itemsBySaleId.get(sale.id) ?? [])),
      total
    }
  }
}
