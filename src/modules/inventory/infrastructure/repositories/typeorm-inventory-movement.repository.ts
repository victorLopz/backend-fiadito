import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm"
import { KardexHistoryFilterDto, KardexHistoryItemDto } from "../../domain/dto/kardex-history.dto"
import { InventoryMovementType } from "../../domain/enums/inventory-movement-type.enum"
import { InventoryMovementRepository } from "../../domain/repositories/inventory-movement.repository"
import { InventoryMovementTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/inventory-movement.typeorm-entity"
import { ProductTypeOrmEntity } from "src/shared/infrastructure/persistence/entities/product.typeorm-entity"

@Injectable()
export class TypeOrmInventoryMovementRepository implements InventoryMovementRepository {
  constructor(
    @InjectRepository(InventoryMovementTypeOrmEntity)
    private readonly movementRepository: Repository<InventoryMovementTypeOrmEntity>,
    @InjectRepository(ProductTypeOrmEntity)
    private readonly productRepository: Repository<ProductTypeOrmEntity>
  ) {}

  async create(input: {
    businessId: string
    productId: string
    type: InventoryMovementType
    quantity: number
    reason?: string
    createdBy: string
  }): Promise<Date> {
    const saved = await this.movementRepository.save(
      this.movementRepository.create({
        businessId: input.businessId,
        productId: input.productId,
        type: input.type,
        quantity: input.quantity,
        reason: input.reason,
        createdBy: input.createdBy
      })
    )

    return saved.createdAt
  }

  async findKardex(
    businessId: string,
    filters: KardexHistoryFilterDto
  ): Promise<{ items: KardexHistoryItemDto[]; total: number }> {
    const where: FindOptionsWhere<InventoryMovementTypeOrmEntity> = {
      businessId
    }

    if (filters.productId) {
      where.productId = filters.productId
    }

    if (filters.type) {
      where.type = filters.type as InventoryMovementType
    }

    if (filters.fromDate && filters.toDate) {
      where.createdAt = Between(filters.fromDate, filters.toDate)
    } else if (filters.fromDate) {
      where.createdAt = MoreThanOrEqual(filters.fromDate)
    } else if (filters.toDate) {
      where.createdAt = LessThanOrEqual(filters.toDate)
    }

    const [movements, total] = await this.movementRepository.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    })

    const productIds = [...new Set(movements.map((movement) => movement.productId))]
    const products =
      productIds.length > 0
        ? await this.productRepository.find({
            where: productIds.map((id) => ({ id, businessId }))
          })
        : []

    const productMap = new Map(products.map((product) => [product.id, product]))

    const items = movements.map((movement) => {
      const product = productMap.get(movement.productId)
      return {
        movementId: movement.id,
        productId: movement.productId,
        productName: product?.name ?? "Producto desconocido",
        sku: product?.sku ?? "N/A",
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason ?? null,
        createdBy: movement.createdBy,
        createdAt: movement.createdAt
      }
    })

    return { items, total }
  }
}
